import fs from 'fs';
import path from 'path';
import { Mutex } from 'async-mutex';
import { detectBrowser } from './utils/browserDetector.mjs';
import { createDirectoryIfNotExists } from './utils/cookieUtils.mjs';
import { fileURLToPath } from 'url';
import { optimizeBrowserDisplay } from './utils/browserDisplayFixer.mjs';
import { launchEdgeBrowser } from './utils/edgeLauncher.mjs';
import { setupBrowserFingerprint } from './utils/browserFingerprint.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isHeadless = process.env.HEADLESS_BROWSER === 'true' && process.env.USE_MANUAL_LOGIN !== 'true';
let puppeteerModule;
let connect;
if (isHeadless === false) {
    puppeteerModule = await import('puppeteer-real-browser');
    connect = puppeteerModule.connect;
} else {
    puppeteerModule = await import('puppeteer-core');
}

// Session auto-release time (seconds)
const SESSION_LOCK_TIMEOUT = parseInt(process.env.SESSION_LOCK_TIMEOUT || '0', 10);

// Store accounts that have reached request limit (format: "timestamp | username")
const cooldownFilePath = path.join(__dirname, 'cooldownAccounts.log');

// Cooldown duration (default 24 hours)
const COOLDOWN_DURATION = 24 * 60 * 60 * 1000;

class SessionManager {
    constructor(provider) {
        this.provider = provider;
        this.isCustomModeEnabled = process.env.USE_CUSTOM_MODE === 'true';
        this.isRotationEnabled = process.env.ENABLE_MODE_ROTATION === 'true';
        this.isHeadless = isHeadless; // Whether to hide browser
        this.currentIndex = 0;
        this.usernameList = []; // Cache username list
        this.browserInstances = []; // Browser instance array
        this.browserMutex = new Mutex(); // Browser mutex lock
        this.browserIndex = 0;
        this.sessionAutoUnlockTimers = {}; // Auto-unlock timers
        this.cooldownList = this.loadCooldownList(); // Load and clean up cooldown file
        this.cleanupCooldownList();
    }

    setSessions(sessions) {
        this.sessions = sessions;
        this.usernameList = Object.keys(this.sessions);

        // Initialize related properties for each session
        for (const username in this.sessions) {
            const session = this.sessions[username];
            session.locked = false;           // Mark if session is locked
            session.requestCount = 0;         // Request counter
            session.valid = true;            // Mark if session is valid
            session.mutex = new Mutex();      // Create mutex lock
            if (session.currentMode === undefined) {
                session.currentMode = this.isCustomModeEnabled ? 'custom' : 'default';
            }
            if (!session.modeStatus) {
                session.modeStatus = {
                    default: true,
                    custom: true,
                };
            }
            session.rotationEnabled = true; // Whether to enable mode rotation
            session.switchCounter = 0; // Mode switch counter
            session.requestsInCurrentMode = 0; // Number of requests in current mode
            session.lastDefaultThreshold = 0; // Last default mode threshold
            session.switchThreshold = this.provider.getRandomSwitchThreshold(session);

            // Track number of requests
            session.youTotalRequests = 0;
            // Weight
            if (typeof session.weight !== 'number') {
                session.weight = 1;
            }
        }
    }

    loadCooldownList() {
        try {
            if (!fs.existsSync(cooldownFilePath)) {
                fs.writeFileSync(cooldownFilePath, '', 'utf8');
                return [];
            }
            const lines = fs.readFileSync(cooldownFilePath, 'utf8')
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);

            const arr = [];
            for (const line of lines) {
                const parts = line.split('|').map(x => x.trim());
                if (parts.length === 2) {
                    const timestamp = parseInt(parts[0], 10);
                    const name = parts[1];
                    if (!isNaN(timestamp) && name) {
                        arr.push({ time: timestamp, username: name });
                    }
                }
            }
            return arr;
        } catch (err) {
            console.error(`Error reading ${cooldownFilePath}:`, err);
            return [];
        }
    }

    saveCooldownList() {
        try {
            const lines = this.cooldownList.map(item => `${item.time} | ${item.username}`);
            fs.writeFileSync(cooldownFilePath, lines.join('\n') + '\n', 'utf8');
        } catch (err) {
            console.error(`Error writing to ${cooldownFilePath}:`, err);
        }
    }

    // Clean up expired items (exceeding specified cooldown duration)
    cleanupCooldownList() {
        const now = Date.now();
        let changed = false;
        this.cooldownList = this.cooldownList.filter(item => {
            const expired = (now - item.time) >= COOLDOWN_DURATION;
            if (expired) changed = true;
            return !expired;
        });
        if (changed) {
            this.saveCooldownList();
        }
    }

    recordLimitedAccount(username) {
        const now = Date.now();
        const already = this.cooldownList.find(x => x.username === username);
        if (!already) {
            this.cooldownList.push({ time: now, username });
            this.saveCooldownList();
            console.log(`Writing to cooldown list: ${new Date(now).toLocaleString()} | ${username}`);
        }
    }

    // Whether account is in cooldown (within 24 hours)
    isInCooldown(username) {
        this.cleanupCooldownList();
        return this.cooldownList.some(item => item.username === username);
    }

    // Batch initialize browser instances
    async initBrowserInstancesInBatch() {
        const browserCount = parseInt(process.env.BROWSER_INSTANCE_COUNT) || 1;
        // Can be 'chrome', 'edge', or 'auto'
        const browserPath = detectBrowser(process.env.BROWSER_TYPE || 'auto');
        const sharedProfilePath = path.join(__dirname, 'browser_profiles');
        createDirectoryIfNotExists(sharedProfilePath);

        const tasks = [];
        for (let i = 0; i < browserCount; i++) {
            const browserId = `browser_${i}`;
            const userDataDir = path.join(sharedProfilePath, browserId);
            createDirectoryIfNotExists(userDataDir);

            tasks.push(this.launchSingleBrowser(browserId, userDataDir, browserPath));
        }

        // Parallel execution
        const results = await Promise.all(tasks);
        for (const instanceInfo of results) {
            this.browserInstances.push(instanceInfo);
            console.log(`Created browser instance: ${instanceInfo.id}`);
        }
    }

    async launchSingleBrowser(browserId, userDataDir, browserPath) {
        let browser, page;
        const isEdge = browserPath.toLowerCase().includes('msedge') ||
            process.env.BROWSER_TYPE === 'edge';
        if (isEdge) {
            try {
                const debugPort = 9222 + parseInt(browserId.replace('browser_', ''), 10);
                const result = await launchEdgeBrowser(userDataDir, browserPath, debugPort);
                browser = result.browser;
                page = result.page;

                console.log(`Edge browser started successfully (browserId=${browserId})`);
            } catch (error) {
                console.error(`Failed to start native Edge:`, error);
                console.log(`Falling back to standard browser startup...`);
            }
        }

        if (!browser) {
            if (isHeadless === false) {
                // Use puppeteer-real-browser
                const response = await connect({
                    headless: 'auto',
                    turnstile: true,
                    customConfig: {
                        userDataDir: userDataDir,
                        executablePath: browserPath,
                        args: [
                            '--no-sandbox',
                            '--disable-setuid-sandbox',
                            '--remote-debugging-address=::',
                            '--window-size=1280,850',
                            '--force-device-scale-factor=1',
                        ],
                    },
                });
                browser = response.browser;
                page = response.page;
            } else {
                // Use puppeteer-core
                browser = await puppeteerModule.launch({
                    headless: this.isHeadless,
                    executablePath: browserPath,
                    userDataDir: userDataDir,
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-gpu',
                        '--disable-dev-shm-usage',
                        '--remote-debugging-port=0',
                        '--window-size=1280,850',
                        '--force-device-scale-factor=1',
                    ],
                });
                page = await browser.newPage();
            }
        }

        const originalUserAgent = await page.evaluate(() => navigator.userAgent);
        // console.log(`浏览器 ${browserId} 原始用户代理: ${originalUserAgent}`);

        const browserType = isEdge ? 'edge' : 'chrome';
        const fingerprint = await setupBrowserFingerprint(page, browserType);

        try {
            const newUserAgent = await page.evaluate(() => navigator.userAgent);
            const newPlatform = await page.evaluate(() => navigator.platform);
            const newCores = await page.evaluate(() => navigator.hardwareConcurrency);

            // console.log(`浏览器 ${browserId} 应用指纹后:`);
            // console.log(`- 用户代理: ${newUserAgent}`);
            // console.log(`- 平台: ${newPlatform}`);
            // console.log(`- CPU核心: ${newCores}`);
            // console.log(`- 内存: ${fingerprint.ram}GB`);
            // console.log(`- 设备名称: ${fingerprint.deviceName}`);

            const isActuallyEdge = newUserAgent.includes('Edg');

            // Optimize display
            try {
                await optimizeBrowserDisplay(page, {
                    width: 1280,
                    height: 850,
                    deviceScaleFactor: 1,
                    cssScale: 1,
                    fixHighDpi: true,
                    isHeadless: this.isHeadless
                });
            } catch (error) {
                console.warn(`Display optimization failed:`, error);
            }

            return {
                id: browserId,
                browser: browser,
                page: page,
                locked: false,
                isEdgeBrowser: isActuallyEdge,
                fingerprint: fingerprint  // Store fingerprint info
            };
        } catch (error) {
            console.error(`Error verifying fingerprint:`, error);

            try {
                await optimizeBrowserDisplay(page, {
                    width: 1280,
                    height: 850,
                    deviceScaleFactor: 1,
                    cssScale: 1,
                    fixHighDpi: true,
                    isHeadless: this.isHeadless
                });
            } catch (displayError) {
                console.warn(`Display optimization failed:`, displayError);
            }

            const isActuallyEdge = originalUserAgent.includes('Edg');
            return {
                id: browserId,
                browser: browser,
                page: page,
                locked: false,
                isEdgeBrowser: isActuallyEdge
            };
        }
    }

    async getAvailableBrowser() {
        return await this.browserMutex.runExclusive(async () => {
            const totalBrowsers = this.browserInstances.length;

            for (let i = 0; i < totalBrowsers; i++) {
                const index = (this.browserIndex + i) % totalBrowsers;
                const browserInstance = this.browserInstances[index];

                if (!browserInstance.locked) {
                    browserInstance.locked = true;
                    this.browserIndex = (index + 1) % totalBrowsers;
                    return browserInstance;
                }
            }
            throw new Error('Current load is saturated, please try again later (maximum concurrency reached)');
        });
    }

    async releaseBrowser(browserId) {
        await this.browserMutex.runExclusive(async () => {
            const browserInstance = this.browserInstances.find(b => b.id === browserId);
            if (browserInstance) {
                browserInstance.locked = false;
            }
        });
    }

    async getAvailableSessions() {
        const allSessionsLocked = this.usernameList.every(username => this.sessions[username].locked);
        if (allSessionsLocked) {
            throw new Error('All sessions are saturated, please try again later (no available accounts)');
        }

        // Collect all valid && !locked && (not in cooldown)
        let candidates = [];
        for (const username of this.usernameList) {
            const session = this.sessions[username];
            // 如果没被锁 并且 session.valid
            if (session.valid && !session.locked) {
                if (this.provider.enableRequestLimit && this.isInCooldown(username)) {
                    // console.log(`账号 ${username} 处于 24 小时冷却中，跳过`);
                    continue;
                }
                candidates.push(username);
            }
        }

        if (candidates.length === 0) {
            throw new Error('No available sessions');
        }

        // Random shuffle
        shuffleArray(candidates);

        // Weighted drawing
        let weightSum = 0;
        for (const uname of candidates) {
            weightSum += this.sessions[uname].weight;
        }

        // Generate random value
        const randValue = Math.floor(Math.random() * weightSum) + 1;

        // Iterate and subtract
        let cumulative = 0;
        let selectedUsername = null;
        for (const uname of candidates) {
            cumulative += this.sessions[uname].weight;
            if (randValue <= cumulative) {
                selectedUsername = uname;
                break;
            }
        }

        if (!selectedUsername) {
            selectedUsername = candidates[0];
        }

        const selectedSession = this.sessions[selectedUsername];

        // Attempt to lock account again
        const result = await selectedSession.mutex.runExclusive(async () => {
            if (selectedSession.locked) {
                return null;
            }

            // Determine availability
            if (selectedSession.modeStatus && selectedSession.modeStatus[selectedSession.currentMode]) {
                // Lock
                selectedSession.locked = true;
                selectedSession.requestCount++;

                // Get available browser
                const browserInstance = await this.getAvailableBrowser();

                // Start auto-unlock timer
                if (SESSION_LOCK_TIMEOUT > 0) {
                    this.startAutoUnlockTimer(selectedUsername, browserInstance.id);
                }

                return {
                    selectedUsername,
                    modeSwitched: false,
                    browserInstance
                };
            } else if (
                this.isCustomModeEnabled &&
                this.isRotationEnabled &&
                this.provider &&
                typeof this.provider.switchMode === 'function'
            ) {
                console.warn(`Attempting to switch mode for account ${selectedUsername}...`);
                this.provider.switchMode(selectedSession);
                selectedSession.rotationEnabled = false;

                if (selectedSession.modeStatus && selectedSession.modeStatus[selectedSession.currentMode]) {
                    selectedSession.locked = true;
                    selectedSession.requestCount++;
                    const browserInstance = await this.getAvailableBrowser();

                    if (SESSION_LOCK_TIMEOUT > 0) {
                        this.startAutoUnlockTimer(selectedUsername, browserInstance.id);
                    }

                    return {
                        selectedUsername,
                        modeSwitched: true,
                        browserInstance
                    };
                }
            }

            return null;
        });

        if (result) {
            return result;
        } else {
            throw new Error('Session just occupied or mode unavailable!');
        }
    }

    startAutoUnlockTimer(username, browserId) {
        // Clear any residual timers
        if (this.sessionAutoUnlockTimers[username]) {
            clearTimeout(this.sessionAutoUnlockTimers[username]);
        }
        const lockDurationMs = SESSION_LOCK_TIMEOUT * 1000;

        this.sessionAutoUnlockTimers[username] = setTimeout(async () => {
            const session = this.sessions[username];
            if (session && session.locked) {
                console.warn(
                    `Session "${username}" automatically unlocked`
                );

                await session.mutex.runExclusive(async () => {
                    session.locked = false;
                });

            }
        }, lockDurationMs);
    }

    async releaseSession(username, browserId) {
        const session = this.sessions[username];
        if (session) {
            await session.mutex.runExclusive(() => {
                session.locked = false;
            });
        }
        // Clear existing timer
        if (this.sessionAutoUnlockTimers[username]) {
            clearTimeout(this.sessionAutoUnlockTimers[username]);
            delete this.sessionAutoUnlockTimers[username];
        }

        if (browserId) {
            await this.releaseBrowser(browserId);
        }
    }

    // Return sessions
    // getBrowserInstances() {
    //     return this.browserInstances;
    // }

    // Strategy
    async getSessionByStrategy(strategy = 'round_robin') {
        if (strategy === 'round_robin') {
            return await this.getAvailableSessions();
        }
        throw new Error(`Unimplemented strategy: ${strategy}`);
    }
}

/**
 * Fisher–Yates Shuffle
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

export default SessionManager;