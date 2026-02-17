import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import { Mutex } from 'async-mutex';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Logger {
    constructor() {
        this.logMutex = new Mutex();
        this.logFilePath = path.join(__dirname, 'requests.log');
        this.statistics = {};
        this.monthStart = this.getMonthStart();
        this.today = this.getToday();
        this.loadStatistics();
    }

    getMonthStart() {
        const now = new Date();
        // First day of the month
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        monthStart.setHours(0, 0, 0, 0);
        return monthStart;
    }

    getToday() {
        const now = new Date();
        // Get current date
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        today.setHours(0, 0, 0, 0);
        return today;
    }

    // Load logs
    loadStatistics() {
        this.logMutex.runExclusive(() => {
            if (!fs.existsSync(this.logFilePath)) {
                fs.writeFileSync(this.logFilePath, '', 'utf8');
                return;
            }
            const data = fs.readFileSync(this.logFilePath, 'utf-8');
            const entries = data.split('\n').filter(line => line.trim());
            const validEntries = [];

            for (const line of entries) {
                try {
                    const logEntry = JSON.parse(line);

                    // Fill missing fields
                    if (!logEntry.provider) {
                        logEntry.provider = 'you';
                    }
                    if (!logEntry.email) {
                        logEntry.email = 'unknown';
                    }
                    if (!logEntry.mode) {
                        logEntry.mode = 'default';
                    }
                    if (logEntry.model === undefined) {
                        logEntry.model = 'unknown';
                    }
                    if (logEntry.completed === undefined) {
                        logEntry.completed = false;
                    }
                    if (logEntry.unusualQueryVolume === undefined) {
                        logEntry.unusualQueryVolume = false;
                    }

                    // Adjust field order
                    const logEntryArray = [
                        ['provider', logEntry.provider],
                        ['email', logEntry.email],
                        ['time', logEntry.time],
                        ['mode', logEntry.mode],
                        ['model', logEntry.model],
                        ['completed', logEntry.completed],
                        ['unusualQueryVolume', logEntry.unusualQueryVolume],
                    ];
                    const formattedLogEntry = Object.fromEntries(logEntryArray);

                    validEntries.push(formattedLogEntry);
                } catch (e) {
                    console.warn(`Unparsable log, ignored: ${line}`);
                }
            }

            // Process valid logs
            for (const logEntry of validEntries) {
                const logDate = new Date(logEntry.time);
                const provider = logEntry.provider;
                const email = logEntry.email;

                // Initialize provider
                if (!this.statistics[provider]) {
                    this.statistics[provider] = {};
                }

                // Initialize email
                if (!this.statistics[provider][email]) {
                    this.statistics[provider][email] = {
                        allRequests: [],     // All requests
                        monthlyRequests: [], // Requests this month
                        dailyRequests: [],   // Requests today
                        monthlyStats: {
                            totalRequests: 0,
                            defaultModeCount: 0,
                            customModeCount: 0,
                            modelCount: {},
                        },
                        dailyStats: {
                            totalRequests: 0,
                            defaultModeCount: 0,
                            customModeCount: 0,
                            modelCount: {},
                        }
                    };
                }

                const stats = this.statistics[provider][email];
                stats.allRequests.push(logEntry);

                // Monthly statistics
                if (logDate >= this.monthStart) {
                    stats.monthlyRequests.push(logEntry);
                    this.updateStatistics(stats.monthlyStats, logEntry);
                }

                // Daily statistics
                if (logDate >= this.today) {
                    stats.dailyRequests.push(logEntry);
                    this.updateStatistics(stats.dailyStats, logEntry);
                }
            }

            // Sort by time for each email of each provider
            for (const provider in this.statistics) {
                for (const email in this.statistics[provider]) {
                    const stats = this.statistics[provider][email];
                    stats.allRequests.sort((a, b) => new Date(b.time) - new Date(a.time));
                    stats.monthlyRequests.sort((a, b) => new Date(b.time) - new Date(a.time));
                    stats.dailyRequests.sort((a, b) => new Date(b.time) - new Date(a.time));
                }
            }

            // Clean up invalid data
            const cleanedData = validEntries.map(entry => JSON.stringify(entry)).join('\n') + '\n';
            fs.writeFileSync(this.logFilePath, cleanedData);
        }).catch(err => {
            console.error('loadStatistics() lock exception:', err);
        });
    }

    // Update statistics
    updateStatistics(stats, logEntry) {
        stats.totalRequests++;
        if (logEntry.mode === 'default') {
            stats.defaultModeCount++;
        } else if (logEntry.mode === 'custom') {
            stats.customModeCount++;
        }

        if (logEntry.model) {
            if (!stats.modelCount[logEntry.model]) {
                stats.modelCount[logEntry.model] = 0;
            }
            stats.modelCount[logEntry.model]++;
        }
    }

    // Record request log
    logRequest({ provider, email, time, mode, model, completed, unusualQueryVolume }) {
        const logEntryArray = [
            ['provider', provider || process.env.ACTIVE_PROVIDER || 'you'],
            ['email', email || 'unknown'],
            ['time', time],
            ['mode', mode || 'unknown'],
            ['model', model || 'unknown'],
            ['completed', completed || 'unknown'],
            ['unusualQueryVolume', unusualQueryVolume || 'unknown'],
        ];
        const logEntry = Object.fromEntries(logEntryArray);

        // Write log and update statistics
        this.logMutex.runExclusive(() => {
            fs.appendFileSync(this.logFilePath, JSON.stringify(logEntry) + '\n');

            const logDate = new Date(logEntry.time);
            const providerName = logEntry.provider;
            if (!this.statistics[providerName]) {
                this.statistics[providerName] = {};
            }

            const userEmail = logEntry.email;
            if (!this.statistics[providerName][userEmail]) {
                this.statistics[providerName][userEmail] = {
                    allRequests: [],
                    monthlyRequests: [],
                    dailyRequests: [],
                    monthlyStats: {
                        totalRequests: 0,
                        defaultModeCount: 0,
                        customModeCount: 0,
                        modelCount: {},
                    },
                    dailyStats: {
                        totalRequests: 0,
                        defaultModeCount: 0,
                        customModeCount: 0,
                        modelCount: {},
                    }
                };
            }

            const stats = this.statistics[providerName][userEmail];
            stats.allRequests.push(logEntry);

            // 当日统计
            if (logDate >= this.today) {
                stats.dailyRequests.push(logEntry);
                this.updateStatistics(stats.dailyStats, logEntry);
            }

            // 本月统计
            if (logDate >= this.monthStart) {
                stats.monthlyRequests.push(logEntry);
                this.updateStatistics(stats.monthlyStats, logEntry);
            }
        }).catch(err => {
            console.error('logRequest() lock exception:', err);
        });
    }

    // Output current statistics
    printStatistics() {
        const provider = process.env.ACTIVE_PROVIDER || 'you';
        const monthStartStr = this.monthStart.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const todayStr = this.today.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        if (!this.statistics[provider]) {
            console.log(`===== Provider ${provider} has no statistical data =====`);
            return;
        }
        const emails = Object.keys(this.statistics[provider]).sort();
        let hasAnyDailyRequest = false;

        console.log(`===== Request Statistics (Provider=${provider}) =====`);

        for (const email of emails) {
            const stats = this.statistics[provider][email];
            // Any requests today?
            if (stats.dailyStats.totalRequests > 0) {
                hasAnyDailyRequest = true;
                console.log(`User Email: ${email}`);
                console.log(`---------- Monthly Stats [since ${monthStartStr}] ----------`);
                console.log(`Total Requests: ${stats.monthlyStats.totalRequests}`);
                console.log(`default Mode Count: ${stats.monthlyStats.defaultModeCount}`);
                console.log(`custom Mode Count: ${stats.monthlyStats.customModeCount}`);
                console.log('Request count per model:');
                for (const [mdl, count] of Object.entries(stats.monthlyStats.modelCount)) {
                    console.log(`  - ${mdl}: ${count}`);
                }

                console.log(`---------- Daily Stats [${todayStr}] ----------`);
                console.log(`Total Requests: ${stats.dailyStats.totalRequests}`);
                console.log(`default Mode Count: ${stats.dailyStats.defaultModeCount}`);
                console.log(`custom Mode Count: ${stats.dailyStats.customModeCount}`);
                console.log('Request count per model:');
                for (const [mdl, count] of Object.entries(stats.dailyStats.modelCount)) {
                    console.log(`  - ${mdl}: ${count}`);
                }
                console.log('------------------------------');
            }
        }

        if (!hasAnyDailyRequest) {
            console.log(`===== No account requests today (${todayStr}) =====`);
        }

        console.log('================================');
    }
}

export default Logger;