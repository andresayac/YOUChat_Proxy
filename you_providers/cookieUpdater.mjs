import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Mutex } from "async-mutex";

const configMutex = new Mutex(); // Mutex lock

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_FILE_PATH = path.join(__dirname, "../config.mjs");

// Only takes effect when USE_MANUAL_LOGIN is false and ENABLE_AUTO_COOKIE_UPDATE is true
const ENABLE_AUTO_COOKIE_UPDATE = process.env.ENABLE_AUTO_COOKIE_UPDATE === "true";

function unifyQuotesForJSON(str) {
    // 正则匹配 `` `...` ``
    let out = str.replace(/`([^`]*)`/g, (match, p1) => {
        const safe = p1.replace(/"/g, '\\"');
        return `"${safe}"`;
    });
    out = out.replace(/'([^']*)'/g, (match, p1) => {
        const safe = p1.replace(/"/g, '\\"');
        return `"${safe}"`;
    });

    return out;
}


/**
 * Parse DS and DSR from cookies
 * @param {Array} cookies - Array of cookies retrieved
 * @returns {{ ds?: string, dsr?: string }}
 */
function parseDSAndDSR(cookies) {
    let dsValue, dsrValue;
    for (const c of cookies) {
        if (c.name === "DS") {
            dsValue = c.value;
        } else if (c.name === "DSR") {
            dsrValue = c.value;
        }
    }
    return { ds: dsValue, dsr: dsrValue };
}

/**
 * Parse email field from DS
 * @param {string} dsToken - DS cookie
 * @returns {string|null} - Returns email or null
 */
function decodeEmailFromDs(dsToken) {
    try {
        const parts = dsToken.split(".");
        if (parts.length < 2) return null;
        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
        return payload.email || null;
    } catch (err) {
        return null;
    }
}

/**
 * Convert cookie array to "name=value; name=value" string
 * @param {Array} cookies
 * @returns {string}
 */
function cookiesToStringAll(cookies) {
    return cookies.map(c => `${c.name}=${c.value}`).join("; ");
}

/**
 * Convert cookie string to array
 * Each object like { name, value }
 * @param {string} cookieStr
 * @returns {Array}
 */
function parseCookieString(cookieStr) {
    return cookieStr.split("; ").map(entry => {
        const [name, value] = entry.split("=", 2);
        return { name, value };
    });
}

/**
 * Look up session matching scientific email in local configObj.sessions
 * @param {object} configObj - Parsed config object
 * @param {string} email - Email to match
 * @returns {{ index: number, oldCookie: string, ds: string, dsr: string } | null}
 */
function findSessionByEmail(configObj, email) {
    if (!Array.isArray(configObj.sessions)) return null;
    for (let i = 0; i < configObj.sessions.length; i++) {
        const cookieStr = configObj.sessions[i].cookie || "";
        const dsMatch = /DS=([^;\s]+)/.exec(cookieStr);
        if (!dsMatch) continue;
        const dsValue = dsMatch[1];
        const dsEmail = decodeEmailFromDs(dsValue);
        if (dsEmail && dsEmail.toLowerCase() === email.toLowerCase()) {
            const dsrMatch = /DSR=([^;\s]+)/.exec(cookieStr);
            const dsrValue = dsrMatch ? dsrMatch[1] : "";
            return {
                index: i,
                oldCookie: cookieStr,
                ds: dsValue,
                dsr: dsrValue
            };
        }
    }
    return null;
}

/**
 * Match sessions with the same email in config.mjs; update the entire cookie if DS or DSR changes
 * @param {import('puppeteer-core').Page} page
 */
export async function updateLocalConfigCookieByEmail(page) {
    if (!ENABLE_AUTO_COOKIE_UPDATE || process.env.USE_MANUAL_LOGIN === "true") {
        return;
    }
    // Try to get cookie from "https://you.com/api/instrumentation"
    let cookieStringFromInstrumentation = "";
    try {
        const instrRequest = await page.waitForRequest(
            req => req.url().includes("/api/instrumentation"),
            { timeout: 5000 }
        );
        if (instrRequest) {
            cookieStringFromInstrumentation = instrRequest.headers()["cookie"];
        }
    } catch (err) {
    }

    let allCookiesString = "";
    if (cookieStringFromInstrumentation) {
        allCookiesString = cookieStringFromInstrumentation;
    } else {
        // Use page.cookies() to get cookies
        const cookies = await page.cookies("https://you.com");
        allCookiesString = cookiesToStringAll(cookies);
    }

    const cookieArray = parseCookieString(allCookiesString);
    const { ds: newDs, dsr: newDsr } = parseDSAndDSR(cookieArray);
    if (!newDs) {
        console.log("DS not found on page, skipping update.");
        return;
    }
    const newEmail = decodeEmailFromDs(newDs);
    if (!newEmail) {
        console.log("Failed to extract email from DS on page, skipping update.");
        return;
    }

    // Mutex zone
    await configMutex.runExclusive(async () => {
        try {
            if (!fs.existsSync(CONFIG_FILE_PATH)) {
                console.warn(`config.mjs not found: ${CONFIG_FILE_PATH}`);
                return;
            }
            const raw = fs.readFileSync(CONFIG_FILE_PATH, "utf8");
            // Remove "export const config ="
            let jsonString = raw.replace(/^export const config\s*=\s*/, "").trim();

            jsonString = unifyQuotesForJSON(jsonString);

            const configObj = JSON.parse(jsonString);

            const found = findSessionByEmail(configObj, newEmail);
            if (!found) {
                console.log(`Session with email=${newEmail} not found in config, skipping update.`);
                return;
            }

            if (found.ds === newDs && found.dsr === newDsr) {
                console.log(`DS/DSR unchanged (email=${newEmail}), no update needed.`);
                return;
            }

            configObj.sessions[found.index].cookie = allCookiesString;

            const newFileContent = "export const config = " + JSON.stringify(configObj, null, 4);
            fs.writeFileSync(CONFIG_FILE_PATH, newFileContent, "utf8");

            console.log(`Cookie updated (email=${newEmail})`);
        } catch (err) {
            console.warn("Error during cookie update process:", err);
        }
    });
}

/**
 * Non-blocking
 * @param {import('puppeteer-core').Page} page
 */
export function updateLocalConfigCookieByEmailNonBlocking(page) {
    // Ensure asynchronous execution
    setImmediate(() => {
        updateLocalConfigCookieByEmail(page).catch(err =>
            console.error("Cookie update error:", err)
        );
    });
}