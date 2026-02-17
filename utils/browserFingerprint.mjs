import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Operating system
const osList = [
    {
        name: 'Windows',
        versions: ['10.0', '11.0'],
        platforms: ['Win32', 'Win64', 'x64']
    },
    {
        name: 'Macintosh',
        versions: ['Intel Mac OS X 10_15_7', 'Intel Mac OS X 11_6_0', 'Intel Mac OS X 12_3_1', 'Apple Mac OS X 13_2_1'],
        platforms: ['MacIntel']
    },
    {
        name: 'Linux',
        versions: ['x86_64', 'i686'],
        platforms: ['Linux x86_64', 'Linux i686']
    },
    {
        name: 'Android',
        versions: ['11', '12', '13', '14'],
        platforms: ['Android']
    },
    {
        name: 'iOS',
        versions: ['15_4', '16_2', '17_0'],
        platforms: ['iPhone', 'iPad']
    }
];

// Browser
const browserVersions = {
    'chrome': {
        name: 'Chrome',
        // Major.Minor.Build.Patch
        majorVersions: [120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134],
        minorVersions: [0, 1, 2, 3],
        buildVersions: [5000, 5500, 6000, 6500, 6700, 6800, 6900, 7000, 7100],
        patchVersions: [80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200],
        brandName: "Google Chrome",
        brandVersion: "1.0.0.0",
        fullVersion: "1.0.0.0",
    },
    'edge': {
        name: 'Edge',
        majorVersions: [120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134],
        minorVersions: [0, 1, 2, 3],
        buildVersions: [5000, 5500, 6000, 6500, 6700, 6800, 6900, 7000, 7100],
        patchVersions: [80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200],
        brandName: "Microsoft Edge",
        brandVersion: "1.0.0.0",
        fullVersion: "1.0.0.0",
    },
    'firefox': {
        name: 'Firefox',
        majorVersions: [120, 121, 122, 123, 124],
        minorVersions: [0, 1, 2],
        buildVersions: [],
        patchVersions: [],
        brandName: "Firefox",
        brandVersion: "1.0",
        fullVersion: "1.0",
    },
    'safari': {
        name: 'Safari',
        majorVersions: [15, 16, 17],
        minorVersions: [0, 1, 2, 3, 4, 5, 6],
        buildVersions: [],
        patchVersions: [],
        brandName: "Safari",
        brandVersion: "1.0.0",
        fullVersion: "1.0.0",
    },
    'opera': {
        name: 'Opera',
        majorVersions: [96, 97, 98, 99, 100, 101],
        minorVersions: [0, 1, 2, 3],
        buildVersions: [1000, 2000, 3000, 4000],
        patchVersions: [10, 20, 30, 40, 50],
        brandName: "Opera",
        brandVersion: "1.0.0.0",
        fullVersion: "1.0.0.0",
    }
};

// WebGL vendor and renderer mapping table
const gpuInfo = {
    'NVIDIA': [
        'ANGLE (NVIDIA, NVIDIA GeForce GTX 1650 Direct3D11 vs_5_0 ps_5_0, D3D11)',
        'ANGLE (NVIDIA, NVIDIA GeForce RTX 2060 Direct3D11 vs_5_0 ps_5_0, D3D11)',
        'ANGLE (NVIDIA, NVIDIA GeForce RTX 2070 Direct3D11 vs_5_0 ps_5_0, D3D11)',
        'ANGLE (NVIDIA, NVIDIA GeForce RTX 3050 Direct3D11 vs_5_0 ps_5_0, D3D11)',
        'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)',
        'ANGLE (NVIDIA, NVIDIA GeForce RTX 3070 Direct3D11 vs_5_0 ps_5_0, D3D11)',
        'ANGLE (NVIDIA, NVIDIA GeForce RTX 3080 Direct3D11 vs_5_0 ps_5_0, D3D11)',
        'ANGLE (NVIDIA, NVIDIA GeForce RTX 3090 Direct3D11 vs_5_0 ps_5_0, D3D11)',
        'ANGLE (NVIDIA, NVIDIA GeForce RTX 4060 Direct3D11 vs_5_0 ps_5_0, D3D11)',
        'ANGLE (NVIDIA, NVIDIA GeForce RTX 4070 Direct3D11 vs_5_0 ps_5_0, D3D11)',
        'ANGLE (NVIDIA, NVIDIA GeForce RTX 4080 Direct3D11 vs_5_0 ps_5_0, D3D11)',
        'ANGLE (NVIDIA, NVIDIA GeForce RTX 4090 Direct3D11 vs_5_0 ps_5_0, D3D11)',
        'ANGLE (NVIDIA, NVIDIA GeForce GTX 1660 SUPER Direct3D11 vs_5_0 ps_5_0, D3D11)',
    ],
    'AMD': [
        'ANGLE (AMD, AMD Radeon RX 570 Direct3D11 vs_5_0 ps_5_0, D3D11)',
        'ANGLE (AMD, AMD Radeon RX 580 Direct3D11 vs_5_0 ps_5_0, D3D11)',
        'ANGLE (AMD, AMD Radeon RX 5500 XT Direct3D11 vs_5_0 ps_5_0, D3D11)',
        'ANGLE (AMD, AMD Radeon RX 5600 XT Direct3D11 vs_5_0 ps_5_0, D3D11)',
        'ANGLE (AMD, AMD Radeon RX 5700 XT Direct3D11 vs_5_0 ps_5_0, D3D11)',
        'ANGLE (AMD, AMD Radeon RX 6600 Direct3D11 vs_5_0 ps_5_0, D3D11)',
        'ANGLE (AMD, AMD Radeon RX 6700 XT Direct3D11 vs_5_0 ps_5_0, D3D11)',
        'ANGLE (AMD, AMD Radeon RX 6800 XT Direct3D11 vs_5_0 ps_5_0, D3D11)',
        'ANGLE (AMD, AMD Radeon RX 6900 XT Direct3D11 vs_5_0 ps_5_0, D3D11)',
        'ANGLE (AMD, AMD Radeon RX 7600 Direct3D11 vs_5_0 ps_5_0, D3D11)',
        'ANGLE (AMD, AMD Radeon RX 7700 XT Direct3D11 vs_5_0 ps_5_0, D3D11)',
        'ANGLE (AMD, AMD Radeon RX 7800 XT Direct3D11 vs_5_0 ps_5_0, D3D11)',
        'ANGLE (AMD, AMD Radeon RX 7900 XT Direct3D11 vs_5_0 ps_5_0, D3D11)',
    ],
    'Intel': [
        'ANGLE (Intel, Intel(R) UHD Graphics 620 Direct3D11 vs_5_0 ps_5_0, D3D11)',
        'ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0, D3D11)',
        'ANGLE (Intel, Intel(R) UHD Graphics 730 Direct3D11 vs_5_0 ps_5_0, D3D11)',
        'ANGLE (Intel, Intel(R) UHD Graphics 750 Direct3D11 vs_5_0 ps_5_0, D3D11)',
        'ANGLE (Intel, Intel(R) Iris(TM) Xe Graphics Direct3D11 vs_5_0 ps_5_0, D3D11)',
        'ANGLE (Intel, Intel(R) Iris(TM) Plus Graphics 655 Direct3D11 vs_5_0 ps_5_0, D3D11)',
        'ANGLE (Intel, Intel(R) Arc(TM) A380 Graphics Direct3D11 vs_5_0 ps_5_0, D3D11)',
    ],
    'Apple': [
        'Apple M1',
        'Apple M1 Pro',
        'Apple M1 Max',
        'Apple M1 Ultra',
        'Apple M2',
        'Apple M2 Pro',
        'Apple M2 Max',
        'Apple M3',
        'Apple M3 Pro',
        'Apple M3 Max',
    ],
    'Mobile': [
        'Mali-G78 MP12',
        'Adreno 650',
        'Adreno 660',
        'Adreno 730',
        'Apple GPU (Metal)',
    ]
};

// Device name list
const deviceNames = [
    // Windows
    'DESKTOP-', 'LAPTOP-', 'PC-', 'WIN-', 'WORKSTATION-',
    // Mac
    'MacBook-Pro', 'MacBook-Air', 'iMac-Pro', 'Mac-mini', 'Mac-Studio',
    // 通用
    'DELL-', 'HP-', 'LENOVO-', 'ASUS-', 'ACER-', 'MSI-', 'ALIENWARE-', 'GIGABYTE-'
];

// Generate random device name suffix
function generateDeviceNameSuffix() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const length = Math.floor(Math.random() * 6) + 4; // 4-9 characters

    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
}

// MAC address
const macPrefixes = [
    'E8-2A-EA', '00-1A-2B', 'AC-DE-48', 'B8-27-EB', 'DC-A6-32',
    '00-50-56', '00-0C-29', '00-05-69', '00-25-90', 'BC-5F-F4',
    '48-45-20', '6C-4B-90', '94-E9-79', '5C-F9-38', '64-BC-0C',
    'B4-2E-99', '8C-85-90', '34-97-F6', 'A4-83-E7', '78-7B-8A'
];

// Regional language
const localeSettings = {
    'en-US': {
        languages: ['en-US', 'en'],
        timeZones: ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles']
    },
    'en-GB': {
        languages: ['en-GB', 'en-US', 'en'],
        timeZones: ['Europe/London', 'Europe/Dublin']
    },
    'zh-CN': {
        languages: ['zh-CN', 'zh', 'en-US', 'en'],
        timeZones: ['Asia/Shanghai', 'Asia/Hong_Kong']
    },
    'zh-TW': {
        languages: ['zh-TW', 'zh', 'en-US', 'en'],
        timeZones: ['Asia/Taipei']
    },
    'ja-JP': {
        languages: ['ja-JP', 'ja', 'en-US', 'en'],
        timeZones: ['Asia/Tokyo']
    },
    'ko-KR': {
        languages: ['ko-KR', 'ko', 'en-US', 'en'],
        timeZones: ['Asia/Seoul']
    },
    'fr-FR': {
        languages: ['fr-FR', 'fr', 'en-US', 'en'],
        timeZones: ['Europe/Paris']
    },
    'de-DE': {
        languages: ['de-DE', 'de', 'en-US', 'en'],
        timeZones: ['Europe/Berlin']
    },
    'es-ES': {
        languages: ['es-ES', 'es', 'en-US', 'en'],
        timeZones: ['Europe/Madrid']
    },
    'ru-RU': {
        languages: ['ru-RU', 'ru', 'en-US', 'en'],
        timeZones: ['Europe/Moscow']
    },
    'pt-BR': {
        languages: ['pt-BR', 'pt', 'en-US', 'en'],
        timeZones: ['America/Sao_Paulo']
    },
    'nl-NL': {
        languages: ['nl-NL', 'nl', 'en-US', 'en'],
        timeZones: ['Europe/Amsterdam']
    },
    'it-IT': {
        languages: ['it-IT', 'it', 'en-US', 'en'],
        timeZones: ['Europe/Rome']
    },
    'pl-PL': {
        languages: ['pl-PL', 'pl', 'en-US', 'en'],
        timeZones: ['Europe/Warsaw']
    },
    'tr-TR': {
        languages: ['tr-TR', 'tr', 'en-US', 'en'],
        timeZones: ['Europe/Istanbul']
    }
};

// CPU cores
const computerSpecs = [
    { cores: 2, ram: [2, 4] },
    { cores: 4, ram: [4, 8, 16] },
    { cores: 6, ram: [8, 16, 32] },
    { cores: 8, ram: [8, 16, 32, 64] },
    { cores: 10, ram: [16, 32, 64] },
    { cores: 12, ram: [16, 32, 64, 128] },
    { cores: 16, ram: [32, 64, 128] },
    { cores: 24, ram: [32, 64, 128] },
    { cores: 32, ram: [64, 128, 256] }
];

// Plugins
const browserPlugins = {
    'chrome': [
        {
            name: 'Chrome PDF Plugin',
            description: 'Portable Document Format',
            filename: 'internal-pdf-viewer',
            mimeTypes: ['application/pdf']
        },
        {
            name: 'Chrome PDF Viewer',
            description: '',
            filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai',
            mimeTypes: ['application/pdf']
        },
        {
            name: 'Native Client',
            description: '',
            filename: 'internal-nacl-plugin',
            mimeTypes: ['application/x-nacl', 'application/x-pnacl']
        }
    ],
    'edge': [
        {
            name: 'Microsoft Edge PDF Plugin',
            description: 'Portable Document Format',
            filename: 'internal-pdf-viewer',
            mimeTypes: ['application/pdf']
        },
        {
            name: 'Microsoft Edge PDF Viewer',
            description: '',
            filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai',
            mimeTypes: ['application/pdf']
        },
        {
            name: 'Native Client',
            description: '',
            filename: 'internal-nacl-plugin',
            mimeTypes: ['application/x-nacl', 'application/x-pnacl']
        }
    ],
    'firefox': [
        { name: 'Firefox PDF Viewer', description: 'PDF Viewer', filename: 'pdf.js', mimeTypes: ['application/pdf'] }
    ],
    'safari': [
        {
            name: 'QuickTime Plugin',
            description: 'QuickTime Plug-in',
            filename: 'QuickTime Plugin.plugin',
            mimeTypes: ['video/quicktime']
        },
        {
            name: 'WebKit built-in PDF',
            description: 'PDF Viewer',
            filename: 'internal-pdf-viewer',
            mimeTypes: ['application/pdf']
        }
    ]
};

/**
 * Random integer
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * @param {Array} array - Options array
 * @returns {*} - Randomly selected item
 */
function randomChoice(array) {
    if (!Array.isArray(array) || array.length === 0) {
        return null;
    }
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * @param {number} percentChance - true probability percentage (0-100)
 * @returns {boolean} - Random boolean
 */
function randomChance(percentChance) {
    return Math.random() * 100 < percentChance;
}

/**
 * @returns {string} - Random seed
 */
function createRandomSeed() {
    return crypto.randomBytes(16).toString('hex');
}

/**
 * @param {string} seed - Seed string
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} - Pseudo-random number
 */
function seededRandom(seed, min, max) {
    const hash = crypto.createHash('sha256').update(seed).digest('hex');
    const decimal = parseInt(hash.substring(0, 8), 16) / 0xffffffff;
    return Math.floor(decimal * (max - min + 1)) + min;
}

/**
 * Random MAC address
 * @returns {string}
 */
function generateRandomMAC() {
    const prefix = randomChoice(macPrefixes);
    const bytes = [];
    for (let i = 0; i < 3; i++) {
        bytes.push(Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase());
    }
    return `${prefix}-${bytes.join('-')}`;
}

/**
 * Detailed version number
 * @param {Object} browser - Browser
 * @returns {string} - e.g. "133.0.6834.110"
 */
function generateRealisticVersion(browser) {
    if (!browser || !browser.majorVersions) {
        return "100.0.0.0"; // Default value
    }

    const majorVersion = randomChoice(browser.majorVersions);
    const minorVersion = randomChoice(browser.minorVersions || [0]);

    // Chrome/Edge style: 133.0.6834.110
    if (browser.buildVersions && browser.buildVersions.length > 0 && browser.patchVersions && browser.patchVersions.length > 0) {
        const buildVersion = randomChoice(browser.buildVersions);
        const patchVersion = randomChoice(browser.patchVersions);
        return `${majorVersion}.${minorVersion}.${buildVersion}.${patchVersion}`;
    }
    // Firefox style: 123.0.1
    else if (browser.minorVersions && browser.minorVersions.length > 0) {
        return `${majorVersion}.${minorVersion}`;
    }
    // Simple: 15.4
    else {
        return `${majorVersion}.${getRandomInt(0, 9)}`;
    }
}

/**
 * Realistic user agent
 * @param {string} browserType - Browser type
 * @returns {string}
 */
function generateRealisticUserAgent(browserType = null) {
    let browser;
    if (browserType && browserVersions[browserType.toLowerCase()]) {
        browser = browserVersions[browserType.toLowerCase()];
    } else {
        const browserKeys = Object.keys(browserVersions);
        browser = browserVersions[randomChoice(browserKeys)];
    }

    // System
    const os = randomChoice(osList);
    const osVersion = randomChoice(os.versions);
    const platform = randomChoice(os.platforms);

    // Version number
    const version = generateRealisticVersion(browser);
    browser.fullVersion = version;

    // Split version number
    const majorVersionPart = version.split('.')[0];

    let userAgent;

    if (browser.name === 'Chrome' || browser.name === 'Edge') {
        if (os.name === 'Windows') {
            userAgent = `Mozilla/5.0 (Windows NT ${osVersion}; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version} Safari/537.36`;
            if (browser.name === 'Edge') {
                userAgent += ` Edg/${majorVersionPart}.0.${getRandomInt(1000, 2000)}.${getRandomInt(10, 200)}`;
            }
        } else if (os.name === 'Macintosh') {
            userAgent = `Mozilla/5.0 (${os.name}; ${osVersion}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version} Safari/537.36`;
            if (browser.name === 'Edge') {
                userAgent += ` Edg/${majorVersionPart}.0.${getRandomInt(1000, 2000)}.${getRandomInt(10, 200)}`;
            }
        } else if (os.name === 'Linux') {
            userAgent = `Mozilla/5.0 (X11; Linux ${osVersion}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version} Safari/537.36`;
            if (browser.name === 'Edge') {
                userAgent += ` Edg/${majorVersionPart}.0.${getRandomInt(1000, 2000)}.${getRandomInt(10, 200)}`;
            }
        } else if (os.name === 'Android') {
            userAgent = `Mozilla/5.0 (Linux; Android ${osVersion}; SM-${getRandomString(3, true)}${getRandomInt(10, 99)}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version} Mobile Safari/537.36`;
            if (browser.name === 'Edge') {
                userAgent += ` EdgA/${majorVersionPart}.0.${getRandomInt(1000, 2000)}.${getRandomInt(10, 200)}`;
            }
        }
    } else if (browser.name === 'Firefox') {
        if (os.name === 'Windows') {
            userAgent = `Mozilla/5.0 (Windows NT ${osVersion}; Win64; x64; rv:${majorVersionPart}.0) Gecko/20100101 Firefox/${version}`;
        } else if (os.name === 'Macintosh') {
            userAgent = `Mozilla/5.0 (Macintosh; ${osVersion}; rv:${majorVersionPart}.0) Gecko/20100101 Firefox/${version}`;
        } else if (os.name === 'Linux') {
            userAgent = `Mozilla/5.0 (X11; Linux ${osVersion}; rv:${majorVersionPart}.0) Gecko/20100101 Firefox/${version}`;
        } else if (os.name === 'Android') {
            userAgent = `Mozilla/5.0 (Android ${osVersion}; Mobile; rv:${majorVersionPart}.0) Gecko/20100101 Firefox/${version}`;
        }
    } else if (browser.name === 'Safari') {
        if (os.name === 'Macintosh') {
            const webkitVersion = (parseInt(majorVersionPart) + 500) + `.${getRandomInt(1, 36)}.${getRandomInt(1, 15)}`;
            userAgent = `Mozilla/5.0 (Macintosh; ${osVersion}) AppleWebKit/${webkitVersion} (KHTML, like Gecko) Version/${version} Safari/${webkitVersion}`;
        } else if (os.name === 'iOS') {
            const webkitVersion = (parseInt(majorVersionPart) + 500) + `.${getRandomInt(1, 36)}.${getRandomInt(1, 15)}`;
            const device = randomChance(70) ? 'iPhone' : 'iPad';
            userAgent = `Mozilla/5.0 (${device}; CPU OS ${osVersion.replace(/_/g, '_')} like Mac OS X) AppleWebKit/${webkitVersion} (KHTML, like Gecko) Version/${version} Mobile/15E148 Safari/${webkitVersion}`;
        }
    } else if (browser.name === 'Opera') {
        if (os.name === 'Windows') {
            userAgent = `Mozilla/5.0 (Windows NT ${osVersion}; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version} Safari/537.36 OPR/${majorVersionPart}.0.${getRandomInt(2000, 5000)}.${getRandomInt(10, 200)}`;
        } else if (os.name === 'Macintosh') {
            userAgent = `Mozilla/5.0 (Macintosh; ${osVersion}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version} Safari/537.36 OPR/${majorVersionPart}.0.${getRandomInt(2000, 5000)}.${getRandomInt(10, 200)}`;
        } else if (os.name === 'Linux') {
            userAgent = `Mozilla/5.0 (X11; Linux ${osVersion}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version} Safari/537.36 OPR/${majorVersionPart}.0.${getRandomInt(2000, 5000)}.${getRandomInt(10, 200)}`;
        }
    }

    // If no suitable combination is matched, provide a default UA
    if (!userAgent) {
        userAgent = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36`;
    }

    return userAgent;
}

/**
 * Random string
 * @param {number} length - Length
 * @param {boolean} upperOnly - Whether to use only uppercase letters
 * @returns {string}
 */
function getRandomString(length, upperOnly = false) {
    const chars = upperOnly
        ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Consistent browser fingerprint
 * @param {Object} options - Configuration options
 * @returns {Object} - Fingerprint data
 */
export function generateFingerprint(options = {}) {
    const seed = options.seed || createRandomSeed();

    let browserType = options.browserType || null;
    if (browserType && typeof browserType === 'string') {
        browserType = browserType.toLowerCase();
        if (!browserVersions[browserType]) {
            console.warn(`Unsupported browser type: ${browserType}, will use random browser type`);
            browserType = null;
        }
    }

    if (!browserType) {
        const browserKeys = Object.keys(browserVersions);
        browserType = browserKeys[Math.floor(Math.random() * browserKeys.length)];
    }

    // Generate user agent
    const userAgent = options.userAgent || generateRealisticUserAgent(browserType);

    // Select region/language
    const locale = options.locale || randomChoice(Object.keys(localeSettings));
    const localeData = localeSettings[locale];

    // Computer specs
    const computerSpec = options.computerSpec || randomChoice(computerSpecs);

    // Select GPU info
    const gpuVendor = options.gpuVendor || randomChoice(Object.keys(gpuInfo));
    const gpuRenderer = options.gpuRenderer || randomChoice(gpuInfo[gpuVendor] || ['']);

    // Device name
    const deviceNameBase = options.deviceNameBase || randomChoice(deviceNames);
    const deviceName = options.deviceName ||
        (deviceNameBase.endsWith('-') ?
            `${deviceNameBase}${generateDeviceNameSuffix()}` :
            deviceNameBase);

    let platform = options.platform;
    if (!platform) {
        if (userAgent.includes('Windows')) {
            platform = 'Win32';
        } else if (userAgent.includes('Macintosh') || userAgent.includes('Mac OS')) {
            platform = 'MacIntel';
        } else if (userAgent.includes('Linux')) {
            platform = 'Linux x86_64';
        } else if (userAgent.includes('Android')) {
            platform = 'Android';
        } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
            platform = userAgent.includes('iPad') ? 'iPad' : 'iPhone';
        } else {
            platform = 'Win32'; // Default
        }
    }

    // Plugin list
    const plugins = options.plugins || (browserPlugins[browserType] || []);

    // Create
    return {
        seed,
        userAgent,
        browserType,
        platform,
        osInfo: determineOsInfo(userAgent),

        webRTC: options.webRTC !== undefined ? options.webRTC : false,
        timezone: options.timezone || randomChoice(localeData.timeZones || ['UTC']),
        geolocation: options.geolocation || 'prompt',

        // Language and regional settings
        language: options.language || locale,
        languages: options.languages || localeData.languages || [locale, 'en-US'],

        // Fingerprint protection
        canvas: options.canvas || 'noise',
        webGL: options.webGL || 'noise',
        audioContext: options.audioContext || 'noise',
        mediaDevices: options.mediaDevices || 'noise',

        // Hardware info
        webGLMetadata: {
            vendor: `Google Inc. (${gpuVendor})`,
            renderer: gpuRenderer,
            vendorUnmasked: gpuVendor,
            rendererUnmasked: gpuRenderer
        },

        // System resources
        cpu: {
            cores: Number(options.cpuCores || computerSpec.cores),
            architecture: options.cpuArchitecture || 'x86-64'
        },
        ram: options.ram || randomChoice(computerSpec.ram),
        deviceName: deviceName,
        macAddress: options.macAddress || generateRandomMAC(),

        // Other settings
        doNotTrack: options.doNotTrack !== undefined ? options.doNotTrack : randomChoice([null, '0', '1']),
        hardwareAcceleration: options.hardwareAcceleration || 'default',
        plugins: plugins,
        screenOrientation: options.screenOrientation || 'landscape-primary',

        // Version info
        browserVersion: getBrowserVersionFromUA(userAgent),

        // Fingerprint strength
        noiseLevel: options.noiseLevel || 'medium', // low, medium, high
        consistencyLevel: options.consistencyLevel || 'high', // low, medium, high

        touchSupport: options.touchSupport !== undefined
            ? options.touchSupport
            : (userAgent.includes('Mobile') || userAgent.includes('Android') || platform === 'iPhone' || platform === 'iPad'),
        maxTouchPoints: options.maxTouchPoints || (userAgent.includes('Mobile') ? getRandomInt(1, 5) : 0),
        pdfViewerEnabled: options.pdfViewerEnabled !== undefined ? options.pdfViewerEnabled : true
    };
}

/**
 * Determine OS from user agent
 * @param {string} userAgent - User agent
 * @returns {Object} - OS information
 */
function determineOsInfo(userAgent) {
    let name, version, archType;

    if (userAgent.includes('Windows')) {
        name = 'Windows';
        if (userAgent.includes('Windows NT 10.0')) {
            version = '10';
        } else if (userAgent.includes('Windows NT 11.0')) {
            version = '11';
        } else {
            version = '10'; // Default Windows 10
        }
        archType = userAgent.includes('Win64') || userAgent.includes('x64') ? 'x64' : 'x86';
    } else if (userAgent.includes('Mac OS X') || userAgent.includes('Macintosh')) {
        name = 'Mac OS';
        const macOSMatch = userAgent.match(/Mac OS X ([0-9_]+)/) ||
            userAgent.match(/Macintosh; Intel Mac OS X ([0-9_]+)/);
        version = macOSMatch ? macOSMatch[1].replace(/_/g, '.') : '10.15';
        archType = userAgent.includes('Intel') ? 'x64' : 'arm64';
    } else if (userAgent.includes('Linux')) {
        name = 'Linux';
        version = userAgent.match(/Linux ([^;)]+)/) ? userAgent.match(/Linux ([^;)]+)/)[1] : 'x86_64';
        archType = userAgent.includes('x86_64') ? 'x64' : 'x86';
    } else if (userAgent.includes('Android')) {
        name = 'Android';
        const androidMatch = userAgent.match(/Android ([0-9.]+)/);
        version = androidMatch ? androidMatch[1] : '11';
        archType = 'arm64';
    } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
        name = 'iOS';
        const iosMatch = userAgent.match(/OS ([0-9_]+)/);
        version = iosMatch ? iosMatch[1].replace(/_/g, '.') : '15.0';
        archType = 'arm64';
    } else {
        name = 'Unknown';
        version = 'Unknown';
        archType = 'Unknown';
    }

    return { name, version, archType };
}

/**
 * Extract browser version from user agent
 * @param {string} userAgent - User agent
 * @returns {Object} - Browser version
 */
function getBrowserVersionFromUA(userAgent) {
    let name, version, fullVersion;

    if (userAgent.includes('Firefox/')) {
        name = 'Firefox';
        const match = userAgent.match(/Firefox\/([0-9.]+)/);
        fullVersion = match ? match[1] : '100.0';
    } else if (userAgent.includes('Edg/')) {
        name = 'Edge';
        const match = userAgent.match(/Edg\/([0-9.]+)/);
        fullVersion = match ? match[1] : '100.0.0.0';
    } else if (userAgent.includes('OPR/') || userAgent.includes('Opera/')) {
        name = 'Opera';
        const match = userAgent.match(/OPR\/([0-9.]+)/) || userAgent.match(/Opera\/([0-9.]+)/);
        fullVersion = match ? match[1] : '100.0.0.0';
    } else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome/')) {
        name = 'Safari';
        const match = userAgent.match(/Version\/([0-9.]+)/);
        fullVersion = match ? match[1] : '15.0';
    } else if (userAgent.includes('Chrome/')) {
        name = 'Chrome';
        const match = userAgent.match(/Chrome\/([0-9.]+)/);
        fullVersion = match ? match[1] : '100.0.0.0';
    } else {
        name = 'Unknown';
        fullVersion = '1.0.0';
    }

    version = fullVersion.split('.')[0]; // Major version
    return { name, version, fullVersion };
}

/**
 * Apply fingerprint to browser page
 * @param {Object} page - Puppeteer page object
 * @param {Object} fingerprint - Fingerprint object
 * @returns {Promise<boolean>}
 */
export async function applyFingerprint(page, fingerprint) {
    try {
        // Set user agent
        await page.setUserAgent(fingerprint.userAgent);

        // Set language and timezone
        await page.setExtraHTTPHeaders({
            'Accept-Language': fingerprint.languages.join(',')
        });

        await page.emulateTimezone(fingerprint.timezone);

        await page.evaluateOnNewDocument((fp) => {
            const deepClone = (obj) => {
                if (obj === null || typeof obj !== 'object') {
                    return obj;
                }

                if (obj instanceof Date) {
                    return new Date(obj);
                }

                if (obj instanceof RegExp) {
                    return new RegExp(obj);
                }

                if (obj instanceof Array) {
                    return obj.reduce((arr, item, i) => {
                        arr[i] = deepClone(item);
                        return arr;
                    }, []);
                }

                if (obj instanceof Object) {
                    return Object.keys(obj).reduce((newObj, key) => {
                        newObj[key] = deepClone(obj[key]);
                        return newObj;
                    }, {});
                }
            };

            // Save original navigator
            const originalNavigator = window.navigator;
            const properties = Object.getOwnPropertyDescriptors(window.navigator);
            const resultNavigator = {};

            // Allowed writable properties
            const allowedToWrite = [
                'userAgent', 'appVersion', 'platform', 'language', 'languages',
                'deviceMemory', 'hardwareConcurrency', 'doNotTrack', 'webdriver',
                'maxTouchPoints'
            ];

            // Proper UA simulation
            const browserInfo = fp.browserVersion;

            for (const key in properties) {
                let overrideValue;

                switch (key) {
                    case 'userAgent':
                        overrideValue = fp.userAgent;
                        break;
                    case 'appVersion':
                        overrideValue = fp.userAgent.replace('Mozilla/', '');
                        break;
                    case 'platform':
                        overrideValue = fp.platform;
                        break;
                    case 'language':
                        overrideValue = fp.language;
                        break;
                    case 'languages':
                        overrideValue = [...fp.languages];
                        break;
                    case 'deviceMemory':
                        overrideValue = fp.ram;
                        break;
                    case 'hardwareConcurrency':
                        overrideValue = Number(fp.cpu.cores);
                        break;
                    case 'doNotTrack':
                        overrideValue = fp.doNotTrack;
                        break;
                    case 'webdriver':
                        overrideValue = false;
                        break;
                    case 'maxTouchPoints':
                        overrideValue = fp.maxTouchPoints || 0;
                        break;
                    case 'vendor':
                        overrideValue = browserInfo.name === 'Chrome' || browserInfo.name === 'Edge' ? 'Google Inc.' : '';
                        break;
                    case 'appName':
                        overrideValue = 'Netscape';
                        break;
                    case 'appCodeName':
                        overrideValue = 'Mozilla';
                        break;
                }

                // If there is an override value
                if (overrideValue !== undefined) {
                    Object.defineProperty(resultNavigator, key, {
                        value: overrideValue,
                        configurable: false,
                        enumerable: true,
                        writable: false
                    });
                } else if (properties[key].configurable) {
                    // Get from original navigator
                    Object.defineProperty(resultNavigator, key, {
                        get: function () {
                            try {
                                return originalNavigator[key];
                            } catch (e) {
                                return properties[key].value;
                            }
                        },
                        enumerable: properties[key].enumerable,
                        configurable: false
                    });
                } else {
                    // Unconfigurable properties, keep as is
                    if (properties[key].writable) {
                        resultNavigator[key] = originalNavigator[key];
                    } else {
                        Object.defineProperty(resultNavigator, key, {
                            value: originalNavigator[key],
                            writable: properties[key].writable,
                            enumerable: properties[key].enumerable,
                            configurable: properties[key].configurable
                        });
                    }
                }
            }

            // Create proxy to intercept any newly added properties
            const navigatorProxy = new Proxy(resultNavigator, {
                has: (target, key) => key in target || key in originalNavigator,
                get: (target, key) => {
                    if (key in target) {
                        return target[key];
                    }
                    // Use original value
                    return originalNavigator[key];
                },
                set: (target, key, value) => {
                    if (allowedToWrite.includes(key)) {
                        target[key] = value;
                        return true;
                    }
                    return false;
                },
                getOwnPropertyDescriptor: (target, key) => {
                    return Object.getOwnPropertyDescriptor(target, key) ||
                        Object.getOwnPropertyDescriptor(originalNavigator, key);
                },
                defineProperty: (target, key, descriptor) => {
                    if (allowedToWrite.includes(key)) {
                        Object.defineProperty(target, key, descriptor);
                        return true;
                    }
                    return false;
                }
            });

            // Replace navigator
            Object.defineProperty(window, 'navigator', {
                value: navigatorProxy,
                writable: false,
                configurable: false,
                enumerable: true
            });

            if ('userAgentData' in originalNavigator) {
                // Create fake userAgentData
                const brandsList = [];

                if (fp.browserType === 'chrome') {
                    brandsList.push({ brand: "Chromium", version: fp.browserVersion.version });
                    brandsList.push({ brand: "Google Chrome", version: fp.browserVersion.version });
                    brandsList.push({ brand: "Not;A=Brand", version: "99.0.0.0" });
                } else if (fp.browserType === 'edge') {
                    brandsList.push({ brand: "Microsoft Edge", version: fp.browserVersion.version });
                    brandsList.push({ brand: "Chromium", version: fp.browserVersion.version });
                    brandsList.push({ brand: "Not;A=Brand", version: "99.0.0.0" });
                } else if (fp.browserType === 'firefox') {
                    brandsList.push({ brand: "Firefox", version: fp.browserVersion.version });
                    brandsList.push({ brand: "Not;A=Brand", version: "99.0.0.0" });
                }

                const uaDataValues = {
                    brands: brandsList,
                    mobile: fp.userAgent.includes('Mobile'),
                    platform: fp.osInfo.name
                };

                const platformVersion = [fp.osInfo.version, 0, 0, 0];

                const uaData = {
                    brands: brandsList,
                    mobile: fp.userAgent.includes('Mobile'),
                    platform: fp.osInfo.name,
                    architecture: fp.cpu.architecture,
                    bitness: "64",
                    model: "",
                    platformVersion: platformVersion.join('.'),
                    getHighEntropyValues: function (hints) {
                        return new Promise(resolve => {
                            const result = {};

                            if (hints.includes('architecture')) {
                                result.architecture = fp.cpu.architecture;
                            }
                            if (hints.includes('bitness')) {
                                result.bitness = "64";
                            }
                            if (hints.includes('brands')) {
                                result.brands = deepClone(brandsList);
                            }
                            if (hints.includes('mobile')) {
                                result.mobile = fp.userAgent.includes('Mobile');
                            }
                            if (hints.includes('model')) {
                                result.model = "";
                            }
                            if (hints.includes('platform')) {
                                result.platform = fp.osInfo.name;
                            }
                            if (hints.includes('platformVersion')) {
                                result.platformVersion = platformVersion.join('.');
                            }
                            if (hints.includes('uaFullVersion')) {
                                result.uaFullVersion = fp.browserVersion.fullVersion;
                            }
                            if (hints.includes('fullVersionList')) {
                                result.fullVersionList = deepClone(brandsList);
                            }

                            resolve(result);
                        });
                    },
                    toJSON: function () {
                        return {
                            brands: this.brands,
                            mobile: this.mobile,
                            platform: this.platform
                        };
                    }
                };

                // Add to navigator
                Object.defineProperty(navigatorProxy, 'userAgentData', {
                    value: uaData,
                    writable: false,
                    enumerable: true,
                    configurable: false
                });
            }

            if (fp.webRTC === false) {
                // Prevent WebRTC leak
                const origRTCPeerConnection = window.RTCPeerConnection ||
                    window.webkitRTCPeerConnection ||
                    window.mozRTCPeerConnection;

                if (origRTCPeerConnection) {
                    class CustomRTCPeerConnection extends origRTCPeerConnection {
                        constructor(configuration) {
                            // Filter out ICE servers
                            if (configuration && configuration.iceServers) {
                                configuration = {
                                    ...configuration,
                                    iceServers: []
                                };
                            }
                            super(configuration);
                        }

                        createOffer(...args) {
                            // Intercept createOffer
                            return new Promise((resolve, reject) => {
                                super.createOffer(...args)
                                    .then(offer => {
                                        if (offer && offer.sdp) {
                                            offer.sdp = offer.sdp.replace(/IP4 \d+\.\d+\.\d+\.\d+/g, 'IP4 0.0.0.0');
                                        }
                                        resolve(offer);
                                    })
                                    .catch(reject);
                            });
                        }

                        createAnswer(...args) {
                            return new Promise((resolve, reject) => {
                                super.createAnswer(...args)
                                    .then(answer => {
                                        if (answer && answer.sdp) {
                                            answer.sdp = answer.sdp.replace(/IP4 \d+\.\d+\.\d+\.\d+/g, 'IP4 0.0.0.0');
                                        }
                                        resolve(answer);
                                    })
                                    .catch(reject);
                            });
                        }
                    }

                    window.RTCPeerConnection = CustomRTCPeerConnection;
                    window.webkitRTCPeerConnection = CustomRTCPeerConnection;
                    window.mozRTCPeerConnection = CustomRTCPeerConnection;
                }

                // Disable media devices
                const safeMediaDevices = {
                    enumerateDevices: function () {
                        return Promise.resolve([]);
                    },
                    getSupportedConstraints: function () {
                        return {};
                    },
                    getUserMedia: function () {
                        return Promise.reject(new Error('Permission denied'));
                    },
                    getDisplayMedia: function () {
                        return Promise.reject(new Error('Permission denied'));
                    }
                };

                if (originalNavigator.mediaDevices) {
                    Object.defineProperty(navigatorProxy, 'mediaDevices', {
                        value: safeMediaDevices,
                        writable: false,
                        enumerable: true,
                        configurable: false
                    });
                }
            }

            if (fp.canvas === 'noise' || fp.canvas === 'block') {
                const originalGetContext = HTMLCanvasElement.prototype.getContext;
                HTMLCanvasElement.prototype.getContext = function (type, attributes) {
                    if (fp.canvas === 'block' && (type === '2d' || type.includes('webgl'))) {
                        return null;
                    }

                    const context = originalGetContext.call(this, type, attributes);

                    if (!context) return null;

                    if (type === '2d') {
                        // 2D Canvas fingerprint protection
                        const origGetImageData = context.getImageData;
                        const origPutImageData = context.putImageData;
                        const origToDataURL = this.toDataURL;
                        const origToBlob = this.toBlob;

                        // Function to add slight noise
                        const addNoise = function (data) {
                            const noise = Math.floor(Math.random() * 10) / 255;
                            for (let i = 0; i < data.data.length; i += 4) {
                                if (data.data[i + 3] > 0) {
                                    if (Math.random() > 0.5) {
                                        data.data[i + 3] -= noise;
                                    } else {
                                        data.data[i + 3] += noise;
                                    }
                                }
                            }
                            return data;
                        };

                        context.getImageData = function (sx, sy, sw, sh) {
                            const imageData = origGetImageData.call(this, sx, sy, sw, sh);
                            return addNoise(imageData);
                        };

                        this.toDataURL = function (...args) {
                            const dataURL = origToDataURL.apply(this, args);
                            if (!dataURL) return dataURL;

                            // Add slight noise to URL (change last few characters)
                            const lastCommaIndex = dataURL.lastIndexOf(',');
                            if (lastCommaIndex !== -1) {
                                const prefix = dataURL.substring(0, lastCommaIndex + 1);
                                const data = dataURL.substring(lastCommaIndex + 1);
                                const noisyChar = String.fromCharCode(
                                    data.charCodeAt(data.length - 2) + Math.round(Math.random() * 2 - 1)
                                );
                                return prefix + data.substring(0, data.length - 2) + noisyChar + data.substring(data.length - 1);
                            }
                            return dataURL;
                        };

                        this.toBlob = function (callback, ...args) {
                            origToBlob.call(this, (blob) => {
                                if (!blob) {
                                    callback(blob);
                                    return;
                                }

                                const reader = new FileReader();
                                reader.readAsDataURL(blob);
                                reader.onloadend = function () {
                                    // Modify dataURL
                                    const dataURL = reader.result;
                                    const lastCommaIndex = dataURL.lastIndexOf(',');
                                    if (lastCommaIndex !== -1) {
                                        const prefix = dataURL.substring(0, lastCommaIndex + 1);
                                        const data = dataURL.substring(lastCommaIndex + 1);
                                        const noisyChar = String.fromCharCode(
                                            data.charCodeAt(data.length - 2) + Math.round(Math.random() * 2 - 1)
                                        );
                                        const newDataURL = prefix + data.substring(0, data.length - 2) +
                                            noisyChar + data.substring(data.length - 1);

                                        const byteString = atob(newDataURL.split(',')[1]);
                                        const mimeString = newDataURL.split(',')[0].split(':')[1].split(';')[0];
                                        const ab = new ArrayBuffer(byteString.length);
                                        const ia = new Uint8Array(ab);

                                        for (let i = 0; i < byteString.length; i++) {
                                            ia[i] = byteString.charCodeAt(i);
                                        }

                                        callback(new Blob([ab], { type: mimeString }));
                                    }
                                };

                                callback(blob);
                            }, ...args);
                        };
                    } else if (type.includes('webgl') || type.includes('experimental-webgl')) {
                        // WebGL Canvas fingerprint protection
                        const origGetParameter = context.getParameter;

                        context.getParameter = function (parameter) {
                            // UNMASKED_VENDOR_WEBGL
                            if (parameter === 37445) {
                                return fp.webGLMetadata.vendorUnmasked;
                            }
                            // UNMASKED_RENDERER_WEBGL
                            if (parameter === 37446) {
                                return fp.webGLMetadata.rendererUnmasked;
                            }

                            return origGetParameter.call(this, parameter);
                        };
                    }

                    return context;
                };
            }

            if (fp.audioContext === 'noise') {
                const AudioContext = window.AudioContext || window.webkitAudioContext;

                if (AudioContext) {
                    const origAudioContext = AudioContext;

                    // Create AudioContext with noise
                    window.AudioContext = window.webkitAudioContext = function () {
                        const ctx = new origAudioContext();

                        const origGetChannelData = ctx.createAnalyser().getFloatFrequencyData;
                        if (origGetChannelData) {
                            ctx.createAnalyser().getFloatFrequencyData = function (array) {
                                origGetChannelData.call(this, array);
                                // Add slight noise
                                for (let i = 0; i < array.length; i += 50) {
                                    if (array[i]) {
                                        array[i] += (Math.random() * 0.0001) - 0.00005;
                                    }
                                }
                            };
                        }

                        return ctx;
                    };
                }
            }

            // Create custom plugin list
            const mimeTypeArray = [];
            const pluginArray = [];

            if (fp.plugins && Array.isArray(fp.plugins)) {
                fp.plugins.forEach((plugin, pluginIndex) => {
                    if (!plugin || !plugin.name) return;

                    // Create MimeTypes
                    const mimeTypes = {};
                    let mimeTypeCount = 0;

                    if (plugin.mimeTypes && Array.isArray(plugin.mimeTypes)) {
                        plugin.mimeTypes.forEach((type, index) => {
                            const mimeType = {
                                type,
                                description: plugin.description || '',
                                suffixes: plugin.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
                                enabledPlugin: null
                            };

                            mimeTypes[mimeTypeCount] = mimeType;
                            mimeTypes[type] = mimeType;
                            mimeTypeCount++;

                            mimeTypeArray.push(mimeType);
                        });
                    }

                    // Create plugin object
                    const pluginObj = {
                        name: plugin.name,
                        filename: plugin.filename || '',
                        description: plugin.description || '',
                        length: mimeTypeCount,
                        item: function (index) {
                            return this[index];
                        },
                        namedItem: function (name) {
                            return this[name];
                        }
                    };

                    // Extend plugin object
                    for (let i = 0; i < mimeTypeCount; i++) {
                        pluginObj[i] = mimeTypes[i];
                    }

                    // Set enabledPlugin for mime settings
                    Object.values(mimeTypes).forEach(mime => {
                        mime.enabledPlugin = pluginObj;
                    });

                    pluginArray.push(pluginObj);
                });

                // Custom navigator.plugins
                const pluginsObj = {
                    length: pluginArray.length,
                    item: function (index) {
                        return this[index];
                    },
                    namedItem: function (name) {
                        return this[name] || null;
                    },
                    refresh: function () {
                    }
                };

                for (let i = 0; i < pluginArray.length; i++) {
                    const plugin = pluginArray[i];
                    pluginsObj[i] = plugin;
                    pluginsObj[plugin.name] = plugin;
                }

                // Custom navigator.mimeTypes
                const mimeTypesObj = {
                    length: mimeTypeArray.length,
                    item: function (index) {
                        return this[index];
                    },
                    namedItem: function (name) {
                        return this[name] || null;
                    }
                };

                for (let i = 0; i < mimeTypeArray.length; i++) {
                    const mimeType = mimeTypeArray[i];
                    mimeTypesObj[i] = mimeType;
                    mimeTypesObj[mimeType.type] = mimeType;
                }

                // Attach plugins and mimeTypes to navigator
                Object.defineProperty(navigatorProxy, 'plugins', {
                    value: pluginsObj,
                    writable: false,
                    enumerable: true,
                    configurable: false
                });

                Object.defineProperty(navigatorProxy, 'mimeTypes', {
                    value: mimeTypesObj,
                    writable: false,
                    enumerable: true,
                    configurable: false
                });
            }

            // Hide automation
            Object.defineProperty(navigatorProxy, 'webdriver', {
                get: () => false,
                enumerable: true,
                configurable: false
            });

            // Fix Chrome features
            if (window.chrome) {
                const chromeObj = {};
                const originalChrome = window.chrome;

                // Copy original chrome
                for (const key in originalChrome) {
                    try {
                        if (key === 'runtime' && originalChrome.runtime) {
                            // Handle chrome.runtime
                            const runtimeObj = {};
                            for (const rKey in originalChrome.runtime) {
                                try {
                                    runtimeObj[rKey] = originalChrome.runtime[rKey];
                                } catch (e) {
                                }
                            }
                            chromeObj.runtime = runtimeObj;
                        } else {
                            chromeObj[key] = originalChrome[key];
                        }
                    } catch (e) {
                    }
                }

                // Create chrome.app
                chromeObj.app = {
                    isInstalled: false,
                    InstallState: {
                        DISABLED: 'disabled',
                        INSTALLED: 'installed',
                        NOT_INSTALLED: 'not_installed'
                    },
                    RunningState: {
                        CANNOT_RUN: 'cannot_run',
                        READY_TO_RUN: 'ready_to_run',
                        RUNNING: 'running'
                    }
                };

                // Replace chrome
                Object.defineProperty(window, 'chrome', {
                    value: chromeObj,
                    writable: false,
                    enumerable: true,
                    configurable: false
                });
            }

            // Add PDF viewer
            if (fp.pdfViewerEnabled) {
                for (const mimeType of ['application/pdf', 'text/pdf']) {
                    const pdfMime = {
                        type: mimeType,
                        suffixes: 'pdf',
                        description: 'Portable Document Format'
                    };

                    if (navigatorProxy.mimeTypes) {
                        const mimeTypesObj = navigatorProxy.mimeTypes;
                        const index = mimeTypesObj.length;
                        pdfMime.enabledPlugin = navigatorProxy.plugins[0];
                        mimeTypesObj[index] = pdfMime;
                        mimeTypesObj[mimeType] = pdfMime;
                        mimeTypesObj.length++;
                    }
                }
            }

            // Noise
            if (fp.noiseLevel && (fp.noiseLevel === 'medium' || fp.noiseLevel === 'high')) {
                const addNoise = (value, scale) => {
                    if (typeof value !== 'number') return value;
                    const noise = (Math.random() - 0.5) * scale;
                    return value + noise;
                };
            }

            // Clear webdriver
            delete window.__nightmare;
            delete window.cdc_adoQpoasnfa76pfcZLmcfl_Array;
            delete window.cdc_adoQpoasnfa76pfcZLmcfl_Promise;
            delete window.cdc_adoQpoasnfa76pfcZLmcfl_Symbol;

            const originalToString = Function.prototype.toString;
            Function.prototype.toString = function () {
                if (this === Function.prototype.toString) {
                    return originalToString.call(this);
                }

                const fnName = this.name;
                if (fnName === 'getParameter' || fnName === 'getChannelData' || fnName === 'toDataURL' ||
                    fnName === 'toBlob' || fnName === 'getImageData') {
                    return "function " + fnName + "() { [native code] }";
                }

                return originalToString.call(this);
            };

            // Create hidden fingerprint verification
            window._fingerprintId = fp.seed;

            const event = new CustomEvent('fingerprintApplied', {
                detail: { success: true, fingerprintId: fp.seed }
            });
            document.dispatchEvent(event);

        }, fingerprint);

        const debugInfo = await page.evaluate((fp) => {
            return {
                hardwareConcurrency: navigator.hardwareConcurrency,
                hardwareConcurrencyType: typeof navigator.hardwareConcurrency,
                expectedCores: fp.cpu.cores,
                expectedCoresType: typeof fp.cpu.cores
            };
        }, fingerprint);

        // console.log('Fingerprint application debug info:', debugInfo);
        console.log(`Custom browser fingerprint applied: ${fingerprint.userAgent}`);
        return true;
    } catch (error) {
        console.error('Error applying browser fingerprint:', error);
        return false;
    }
}

/**
 * Create and apply fingerprint for a specific browser
 * @param {Object} page - Puppeteer
 * @param {string|Object} options - Browser or full configuration
 * @returns {Promise<Object>} - Applied fingerprint
 */
export async function setupBrowserFingerprint(page, options = {}) {
    try {
        if (typeof options === 'string') {
            options = { browserType: options };
        }

        // Generate full fingerprint
        const fingerprint = generateFingerprint(options);

        // Apply fingerprint
        const success = await applyFingerprint(page, fingerprint);

        // Verify fingerprint application
        if (success) {
            try {
                const appliedUserAgent = await page.evaluate(() => navigator.userAgent);
                if (appliedUserAgent !== fingerprint.userAgent) {
                    console.warn('User agent not applied correctly:', {
                        expected: fingerprint.userAgent,
                        applied: appliedUserAgent
                    });
                }

                // Verify CPU core count
                // const hardwareConcurrency = await page.evaluate(() => navigator.hardwareConcurrency);
                // if (Number(hardwareConcurrency) !== Number(fingerprint.cpu.cores)) {
                //     console.warn('CPU core count not applied correctly:', {
                //         expected: fingerprint.cpu.cores,
                //         applied: hardwareConcurrency,
                //         expectedType: typeof fingerprint.cpu.cores,
                //         appliedType: typeof hardwareConcurrency
                //     });
                // }

                // Verify WebGL
                if (fingerprint.webGL !== 'block') {
                    const webglVendor = await page.evaluate(() => {
                        try {
                            const canvas = document.createElement('canvas');
                            const gl = canvas.getContext('webgl');
                            return gl ? gl.getParameter(gl.getParameter(37445)) : null;
                        } catch (e) {
                            return null;
                        }
                    });

                    if (webglVendor && !webglVendor.includes(fingerprint.webGLMetadata.vendorUnmasked)) {
                        console.warn('WebGL vendor info not applied correctly');
                    }
                }

                console.log('Fingerprint verification successful');
            } catch (verifyError) {
                console.warn('Error during fingerprint verification:', verifyError);
            }
        }

        return fingerprint;
    } catch (error) {
        console.error('Error setting up browser fingerprint:', error);
        throw error;
    }
}

/**
 * Verify if page fingerprint is correctly applied
 * @param {Object} page - Puppeteer
 * @param {Object} fingerprint - Specific fingerprint
 * @returns {Promise<boolean>}
 */
export async function verifyFingerprint(page, fingerprint) {
    try {
        const results = await page.evaluate((fp) => {
            const checks = {
                userAgent: navigator.userAgent === fp.userAgent,
                platform: navigator.platform === fp.platform,
                hardwareConcurrency: Number(navigator.hardwareConcurrency) === Number(fp.cpu.cores),
                language: navigator.language === fp.language,
                deviceMemory: navigator.deviceMemory === fp.ram,
                doNotTrack: navigator.doNotTrack === fp.doNotTrack
            };

            return {
                success: Object.values(checks).every(v => v),
                details: checks
            };
        }, fingerprint);

        console.log('Fingerprint verification result:', results);
        return results.success;
    } catch (error) {
        console.error('Error verifying fingerprint:', error);
        return false;
    }
}

/**
 * Get realistic fingerprint
 * @param {string} browserFamily ('chrome', 'edge', 'firefox', 'safari')
 * @returns {Object} - Fingerprint
 */
export function getRealisticFingerprint(browserFamily = 'chrome') {
    // Standardize browser
    browserFamily = browserFamily.toLowerCase();

    // Select appropriate OS
    let osFamily;
    const browserType = browserFamily;

    if (browserFamily === 'safari') {
        osFamily = Math.random() < 0.8 ? 'Macintosh' : 'iOS';
    } else {
        const osDistribution = {
            'chrome': { 'Windows': 0.65, 'Macintosh': 0.25, 'Linux': 0.08, 'Android': 0.02 },
            'edge': { 'Windows': 0.80, 'Macintosh': 0.18, 'Linux': 0.02 },
            'firefox': { 'Windows': 0.55, 'Macintosh': 0.25, 'Linux': 0.20 }
        };

        const distribution = osDistribution[browserFamily] || { 'Windows': 0.7, 'Macintosh': 0.25, 'Linux': 0.05 };
        const rand = Math.random();
        let cumulative = 0;

        for (const [os, probability] of Object.entries(distribution)) {
            cumulative += probability;
            if (rand <= cumulative) {
                osFamily = os;
                break;
            }
        }
    }

    // Select specs
    let computerSpec;
    if (osFamily === 'Windows' || osFamily === 'Macintosh') {
        computerSpec = {
            cores: [4, 6, 8, 12, 16][Math.floor(Math.random() * 5)],
            ram: [8, 16, 32, 64][Math.floor(Math.random() * 4)]
        };
    } else if (osFamily === 'Linux') {
        computerSpec = {
            cores: [4, 8, 16, 24, 32][Math.floor(Math.random() * 5)],
            ram: [8, 16, 32, 64, 128][Math.floor(Math.random() * 5)]
        };
    } else {
        computerSpec = {
            cores: [2, 4, 6, 8][Math.floor(Math.random() * 4)],
            ram: [4, 6, 8, 12][Math.floor(Math.random() * 4)]
        };
    }

    // Languages
    const commonLanguages = ['en-US', 'en-GB', 'zh-CN', 'es-ES', 'fr-FR', 'de-DE', 'ja-JP', 'ru-RU'];
    const locale = randomChoice(commonLanguages);

    return {
        browserType,
        userAgent: null,
        osFamily,
        computerSpec,
        locale,
        timezone: null,
        webRTC: false,
        noiseLevel: 'medium',
        consistencyLevel: 'high'
    };
}