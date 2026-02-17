import { exec, execSync } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { setupBrowserFingerprint } from './browserFingerprint.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execPromise = promisify(exec);

/**
 * @param {string} userDataDir - User data directory
 * @param {string} edgePath - Edge browser path
 * @param {number} debugPort - Debug port
 * @returns {Promise<object>} - browser and page
 */
export async function launchEdgeBrowser(userDataDir, edgePath, debugPort = 9222) {
    if (!fs.existsSync(userDataDir)) {
        fs.mkdirSync(userDataDir, { recursive: true });
    }

    // Close potential Edge processes
    try {
        if (os.platform() === 'win32') {
            await execPromise('taskkill /f /im msedge.exe').catch(() => {
            });
        } else if (os.platform() === 'darwin') {
            // macOS
            await execPromise('pkill -f "Microsoft Edge"').catch(() => {
            });
        } else {
            // Linux
            await execPromise('pkill -f "microsoft-edge"').catch(() => {
            });
        }
    } catch (e) {
    }

    const remoteDebuggingPort = debugPort;
    let edgeProcess;

    const args = [
        `--remote-debugging-port=${remoteDebuggingPort}`,
        `--user-data-dir="${userDataDir}"`,
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-popup-blocking',
        '--disable-infobars',
        '--disable-translate',
        '--disable-sync',
        '--window-size=1280,850',
        '--force-device-scale-factor=1',
        'about:blank'  // Open blank page
    ];

    try {
        // Start Edge browser
        const cmdArgs = args.join(' ');
        const cmd = `"${edgePath}" ${cmdArgs}`;
        edgeProcess = exec(cmd);

        console.log(`Waiting for Edge browser to start...`);
        await new Promise(resolve => setTimeout(resolve, 3000));

        const puppeteer = await import('puppeteer-core');

        // Connect to browser
        const browser = await puppeteer.connect({
            browserURL: `http://127.0.0.1:${remoteDebuggingPort}`,
            defaultViewport: { width: 1280, height: 850 }
        });

        // Get the first page
        const pages = await browser.pages();
        let page = pages[0];
        if (!page) {
            page = await browser.newPage();
        }

        const originalUserAgent = await page.evaluate(() => navigator.userAgent);
        // console.log(`Edge browser original user agent: ${originalUserAgent}`);

        // Apply random fingerprint
        const fingerprint = await setupBrowserFingerprint(page, 'edge');

        // Verify if fingerprint was successfully applied
        const newUserAgent = await page.evaluate(() => navigator.userAgent);
        // console.log(`Edge browser user agent after applying fingerprint: ${newUserAgent}`);

        if (!newUserAgent.includes('Edg')) {
            console.warn(`Warning: Browser might not be Edge.`);
        }

        return {
            browser,
            page,
            process: edgeProcess,
            fingerprint: fingerprint
        };
    } catch (error) {
        console.error(`Failed to launch Edge browser:`, error);

        if (edgeProcess) {
            try {
                edgeProcess.kill();
            } catch (e) {
            }
        }

        throw error;
    }
}

/**
 * Find Edge browser path
 * @returns {string|null}
 */
export function findEdgePath() {
    const platform = os.platform();

    if (platform === 'win32') {
        const commonPaths = [
            `${process.env['ProgramFiles(x86)']}\\Microsoft\\Edge\\Application\\msedge.exe`,
            `${process.env.ProgramFiles}\\Microsoft\\Edge\\Application\\msedge.exe`,
            `${process.env.LOCALAPPDATA}\\Microsoft\\Edge\\Application\\msedge.exe`,
            `C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe`,
            `C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe`
        ];

        for (const path of commonPaths) {
            if (fs.existsSync(path)) {
                return path;
            }
        }
    } else if (platform === 'darwin') {
        const macPath = '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge';
        if (fs.existsSync(macPath)) {
            return macPath;
        }
    } else {
        // Linux
        try {
            const { stdout } = execSync('which microsoft-edge');
            if (stdout && stdout.trim()) {
                return stdout.trim();
            }
        } catch (e) {
        }
    }
    return null;
}