import express from "express";
import { createEvent, getGitRevision } from "./utils.mjs";
import YouProvider from "./provider.mjs";
import localtunnel from "localtunnel";
import ngrok from 'ngrok';
import { v4 as uuidv4 } from "uuid";
import './proxyAgent.mjs';

const app = express();
const port = process.env.PORT || 8080;
const validApiKey = process.env.PASSWORD;
const availableModels = [
    "gpt_5_2_thinking",
    "gpt_5_2_instant",
    "gpt_5_1_thinking",
    "gpt_5_1_instant",
    "gpt_5",
    "gpt_5_mini",
    "gpt_4_1",
    "gpt_4_1_mini",
    "openai_gpt_oss_120b",
    "claude_4_6_opus_thinking",
    "claude_4_6_opus",
    "claude_4_5_opus_thinking",
    "claude_4_5_opus",
    "claude_4_1_opus_thinking",
    "claude_4_1_opus",
    "claude_4_5_sonnet_thinking",
    "claude_4_5_sonnet",
    "claude_4_sonnet_thinking",
    "claude_4_sonnet",
    "claude_4_5_haiku",
    "gemini_3_pro",
    "gemini_3_flash",
    "gemini_2_5_pro_preview",
    "gemini_2_5_flash_preview",
    "grok_4_1_fast_reasoning",
    "grok_4_1_fast",
    "grok_4",
    "qwen3_235b",
    "deepseek_r1",
    "deepseek_v3",
    "llama4_maverick",
    "llama4_scout",
    "mistral_large_2",
    "custom_assistants"
];
const modelMappping = {
    // OpenAI
    "gpt-5.2-thinking": "gpt_5_2_thinking",
    "gpt-5.2-instant": "gpt_5_2_instant",
    "gpt-5.1-thinking": "gpt_5_1_thinking",
    "gpt-5.1-instant": "gpt_5_1_instant",
    "gpt-5": "gpt_5",
    "gpt-5-mini": "gpt_5_mini",
    "gpt-4.1": "gpt_4_1",
    "gpt-4.1-mini": "gpt_4_1_mini",
    "gpt-oss-120b": "openai_gpt_oss_120b",

    // Anthropic
    "claude-4.6-opus-thinking": "claude_4_6_opus_thinking",
    "claude-4.6-opus": "claude_4_6_opus",
    "claude-4.5-opus-thinking": "claude_4_5_opus_thinking",
    "claude-4.5-opus": "claude_4_5_opus",
    "claude-4.1-opus-thinking": "claude_4_1_opus_thinking",
    "claude-4.1-opus": "claude_4_1_opus",
    "claude-4.5-sonnet-thinking": "claude_4_5_sonnet_thinking",
    "claude-4.5-sonnet": "claude_4_5_sonnet",
    "claude-4-sonnet-thinking": "claude_4_sonnet_thinking",
    "claude-4-sonnet": "claude_4_sonnet",
    "claude-4.5-haiku": "claude_4_5_haiku",

    // Google
    "gemini-3-pro": "gemini_3_pro",
    "gemini-3-flash": "gemini_3_flash",
    "gemini-2.5-pro-preview": "gemini_2_5_pro_preview",
    "gemini-2.5-flash-preview": "gemini_2_5_flash_preview",
    "gemini-2.5-flash": "gemini_2_5_flash_preview",

    // xAI
    "grok-4.1-fast-reasoning": "grok_4_1_fast_reasoning",
    "grok-4.1-fast": "grok_4_1_fast",
    "grok-4": "grok_4",

    // Alibaba
    "qwen3-235b": "qwen3_235b",

    // DeepSeek
    "deepseek-r1": "deepseek_r1",
    "deepseek-v3": "deepseek_v3",
    "deepseek-chat": "deepseek_v3",
    "deepseek-reasoner": "deepseek_r1",

    // Meta
    "llama-4-maverick": "llama4_maverick",
    "llama-4-scout": "llama4_scout",

    // Mistral
    "mistral-large-2": "mistral_large_2",

    // Custom Assistants
    "custom-assistants": "custom_assistants"
};

// import config.mjs
let config;
try {
    const configModule = await import("./config.mjs");
    config = configModule.config;
} catch (e) {
    console.error(e);
    console.error("config.mjs does not exist or has errors, please check.");
    process.exit(1);
}

const provider = new YouProvider(config);
await provider.init(config);

// handle preflight request
app.use((req, res, next) => {
    if (req.method === "OPTIONS") {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "*");
        res.setHeader("Access-Control-Allow-Headers", "*");
        res.setHeader("Access-Control-Max-Age", "86400");
        res.status(200).end();
    } else {
        next();
    }
});

// openai format model request
app.get("/v1/models", OpenAIApiKeyAuth, (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    const models = availableModels.map((model) => {
        return {
            id: model,
            object: "model",
            created: 1700000000,
            owned_by: "closeai",
            name: model,
        };
    });
    res.json({ object: "list", data: models });
});
// handle openai format model request
app.post("/v1/chat/completions", OpenAIApiKeyAuth, (req, res) => {
    // For storing request body
    req.rawBody = "";
    req.setEncoding("utf8");

    // Receive data
    req.on("data", function (chunk) {
        req.rawBody += chunk;
    });

    // Process request after data reception is complete
    req.on("end", async () => {
        console.log("Processing OpenAI format request");
        res.setHeader("Content-Type", "text/event-stream;charset=utf-8");
        res.setHeader("Access-Control-Allow-Origin", "*");
        let jsonBody = JSON.parse(req.rawBody);

        // Normalize messages
        jsonBody.messages = openaiNormalizeMessages(jsonBody.messages);

        console.log("message length:" + jsonBody.messages.length);

        // Get current Provider instance
        const currentProvider = provider.provider;

        // Get session list
        const sessions = currentProvider.sessions;

        // Check for available sessions
        if (!sessions || Object.keys(sessions).length === 0) {
            console.error('No available sessions, please check if Provider initialized successfully or check config file.');
            res.status(503).json({
                error: {
                    message: "No available sessions.",
                    type: "server_error",
                    param: null,
                    code: "service_unavailable"
                }
            });
            return;
        }

        // Randomly select a session
        let randomSession = Object.keys(sessions)[Math.floor(Math.random() * Object.keys(sessions).length)];
        console.log("Using session " + randomSession);

        // Try to map model
        if (jsonBody.model && modelMappping[jsonBody.model]) {
            jsonBody.model = modelMappping[jsonBody.model];
        }
        if (jsonBody.model && !availableModels.includes(jsonBody.model)) {
            res.status(404).json({
                error: {
                    message: `The model '${jsonBody.model}' does not exist`,
                    type: "invalid_request_error",
                    param: null,
                    code: "model_not_found"
                }
            });
            return;
        }
        console.log("Using model " + jsonBody.model);

        // Call provider to get response
        try {
            const { completion, cancel } = await provider.getCompletion({
                username: randomSession,
                messages: jsonBody.messages,
                stream: !!jsonBody.stream,
                proxyModel: jsonBody.model,
                useCustomMode: process.env.USE_CUSTOM_MODE === "true",
                tools: jsonBody.tools,
                tool_choice: jsonBody.tool_choice
            });

            // Listen for start event
            completion.on("start", (id) => {
                if (jsonBody.stream) {
                    // Send message start
                    res.write(
                        createEvent("data", {
                            id: `chatcmpl-${id}`,
                            object: "chat.completion.chunk",
                            created: Math.floor(new Date().getTime() / 1000),
                            model: jsonBody.model,
                            system_fingerprint: "fp_you_proxy",
                            choices: [{
                                index: 0,
                                delta: { role: "assistant", content: "" },
                                logprobs: null,
                                finish_reason: null
                            }],
                        })
                    );
                }
            });

            let hasTools = false;

            // Listen for completion event
            completion.on("completion", (id, data) => {
                if (jsonBody.stream) {
                    let delta = {};
                    if (typeof data === 'string') {
                        delta = { content: data };
                    } else if (data.tool_calls) {
                        delta = { tool_calls: data.tool_calls };
                        hasTools = true;
                    } else if (data.content) {
                        delta = { content: data.content };
                        if (data.tool_calls) {
                            delta.tool_calls = data.tool_calls;
                            hasTools = true;
                        }
                    }

                    // Send message delta
                    res.write(
                        createEvent("data", {
                            id: `chatcmpl-${id}`,
                            object: "chat.completion.chunk",
                            created: Math.floor(new Date().getTime() / 1000),
                            model: jsonBody.model,
                            system_fingerprint: "fp_you_proxy",
                            choices: [
                                {
                                    index: 0,
                                    delta: delta,
                                    logprobs: null,
                                    finish_reason: null,
                                },
                            ],
                        })
                    );
                } else {
                    // Send final response (non-stream)
                    let message = { role: "assistant" };
                    if (typeof data === 'string') {
                        message.content = data;
                    } else {
                        message.content = data.content || null;
                        if (data.tool_calls) {
                            message.tool_calls = data.tool_calls;
                        }
                    }

                    res.write(
                        JSON.stringify({
                            id: `chatcmpl-${id}`,
                            object: "chat.completion",
                            created: Math.floor(new Date().getTime() / 1000),
                            model: jsonBody.model,
                            system_fingerprint: "fp_you_proxy",
                            choices: [
                                {
                                    index: 0,
                                    message: message,
                                    logprobs: null,
                                    finish_reason: data.tool_calls ? "tool_calls" : "stop",
                                },
                            ],
                            usage: {
                                prompt_tokens: 0,
                                completion_tokens: 0,
                                total_tokens: 0,
                            },
                        })
                    );
                    res.end();
                }
            });

            // Listen for end event
            completion.on("end", () => {
                if (jsonBody.stream) {
                    // Send usage chunk before [DONE]
                    try {
                        res.write(
                            createEvent("data", {
                                id: `chatcmpl-${uuidv4()}`,
                                object: "chat.completion.chunk",
                                created: Math.floor(new Date().getTime() / 1000),
                                model: jsonBody.model,
                                system_fingerprint: "fp_you_proxy",
                                choices: [
                                    {
                                        index: 0,
                                        delta: {},
                                        logprobs: null,
                                        finish_reason: hasTools ? "tool_calls" : "stop",
                                    },
                                ],
                                usage: {
                                    prompt_tokens: 0,
                                    completion_tokens: 0,
                                    total_tokens: 0,
                                },
                            })
                        );
                        res.write(createEvent("data", "[DONE]"));
                        res.end();
                    } catch (e) {
                        console.error("Error ending stream:", e);
                    }
                }
            });

            // Listen for error event
            completion.on("error", (err) => {
                console.error("Provider stream error:", err);
                const errorMessage = "Stream Error: " + (err.message || "Unknown error");
                if (jsonBody.stream) {
                    // Try to send error as a message chunk if stream is still open
                    try {
                        res.write(
                            createEvent("data", {
                                id: `chatcmpl-${uuidv4()}`,
                                object: "chat.completion.chunk",
                                created: Math.floor(new Date().getTime() / 1000),
                                model: jsonBody.model,
                                system_fingerprint: "fp_you_proxy",
                                choices: [{
                                    index: 0,
                                    delta: { content: "\n\n[Error: " + errorMessage + "]" },
                                    finish_reason: "stop"
                                }]
                            })
                        );
                        res.write(createEvent("data", "[DONE]"));
                        res.end();
                    } catch (e) {
                        // Stream might be closed already
                    }
                } else {
                    if (!res.headersSent) {
                        res.status(500).json({
                            error: {
                                message: errorMessage,
                                type: "server_error",
                                param: null,
                                code: "internal_error"
                            }
                        });
                    }
                }
            });

            // Listen for client closed event
            res.on("close", () => {
                console.log(" > [Client closed]");
                completion.removeAllListeners();
                cancel();
            });
        } catch (error) {
            console.error(error);
            const errorMessage = "Error occurred, please check the log.\n\nAn error occurred, please check the log: <pre>" + (error.stack || error) + "</pre>";
            if (jsonBody.stream) {
                res.write(
                    createEvent("data", {
                        choices: [
                            {
                                content_filter_results: {
                                    hate: { filtered: false, severity: "safe" },
                                    self_harm: { filtered: false, severity: "safe" },
                                    sexual: { filtered: false, severity: "safe" },
                                    violence: { filtered: false, severity: "safe" },
                                },
                                delta: { content: errorMessage },
                                finish_reason: null,
                                index: 0,
                            },
                        ],
                        created: Math.floor(new Date().getTime() / 1000),
                        id: uuidv4(),
                        model: jsonBody.model,
                        object: "chat.completion.chunk",
                        system_fingerprint: "114514",
                    })
                );
            } else {
                res.write(
                    JSON.stringify({
                        id: uuidv4(),
                        object: "chat.completion",
                        created: Math.floor(new Date().getTime() / 1000),
                        model: jsonBody.model,
                        system_fingerprint: "114514",
                        choices: [
                            {
                                index: 0,
                                message: {
                                    role: "assistant",
                                    content: errorMessage,
                                },
                                logprobs: null,
                                finish_reason: "stop",
                            },
                        ],
                        usage: {
                            prompt_tokens: 1,
                            completion_tokens: 1,
                            total_tokens: 1,
                        },
                    })
                );
            }
            res.end();
        }
    });
});

// Helper function: Normalize messages
function openaiNormalizeMessages(messages) {
    let normalizedMessages = [];
    let currentSystemMessage = "";

    for (let message of messages) {
        if (message.role === 'system') {
            if (currentSystemMessage) {
                currentSystemMessage += "\n" + message.content;
            } else {
                currentSystemMessage = message.content;
            }
        } else {
            if (currentSystemMessage) {
                normalizedMessages.push({ role: 'system', content: currentSystemMessage });
                currentSystemMessage = "";
            }
            normalizedMessages.push(message);
        }
    }

    if (currentSystemMessage) {
        normalizedMessages.push({ role: 'system', content: currentSystemMessage });
    }

    return normalizedMessages;
}


// handle anthropic format model request
app.post("/v1/messages", AnthropicApiKeyAuth, (req, res) => {
    req.rawBody = "";
    req.setEncoding("utf8");

    req.on("data", function (chunk) {
        req.rawBody += chunk;
    });

    req.on("end", async () => {
        console.log("Processing Anthropic format request");
        res.setHeader("Content-Type", "text/event-stream;charset=utf-8");
        res.setHeader("Access-Control-Allow-Origin", "*");
        let jsonBody = JSON.parse(req.rawBody);

        // Process message format
        jsonBody.messages = anthropicNormalizeMessages(jsonBody.messages);

        if (jsonBody.system) {
            // Add system message to the beginning of messages
            jsonBody.messages.unshift({ role: "system", content: jsonBody.system });
        }
        console.log("message length:" + jsonBody.messages.length);

        // 获取当前 Provider 实例
        const currentProvider = provider.provider;

        // 获取会话列表
        const sessions = currentProvider.sessions;

        // Check for available sessions
        if (!sessions || Object.keys(sessions).length === 0) {
            console.error('No available sessions, please check if Provider initialized successfully or check config file.');
            res.write(JSON.stringify({
                error: 'No available sessions.',
            }));
            res.end();
            return;
        }

        // Randomly select a session
        let randomSession = Object.keys(sessions)[Math.floor(Math.random() * Object.keys(sessions).length)];
        console.log("Using session " + randomSession);

        // decide which model to use
        let proxyModel;
        if (process.env.AI_MODEL) {
            proxyModel = process.env.AI_MODEL;
        } else if (jsonBody.model && modelMappping[jsonBody.model]) {
            proxyModel = modelMappping[jsonBody.model];
        } else {
            proxyModel = "claude_3_opus";
        }
        console.log(`Using model ${proxyModel}`);

        // call provider to get completion
        try {
            const { completion, cancel } = await provider.getCompletion({
                username: randomSession,
                messages: jsonBody.messages,
                stream: !!jsonBody.stream,
                proxyModel: proxyModel,
                useCustomMode: process.env.USE_CUSTOM_MODE === "true"
            });

            completion.on("start", (id) => {
                if (jsonBody.stream) {
                    // send message start
                    res.write(createEvent("message_start", {
                        type: "message_start",
                        message: {
                            id: `${id}`,
                            type: "message",
                            role: "assistant",
                            content: [],
                            model: proxyModel,
                            stop_reason: null,
                            stop_sequence: null,
                            usage: { input_tokens: 8, output_tokens: 1 },
                        },
                    }));
                    res.write(createEvent("content_block_start", {
                        type: "content_block_start",
                        index: 0,
                        content_block: { type: "text", text: "" }
                    }));
                    res.write(createEvent("ping", { type: "ping" }));
                }
            });

            completion.on("completion", (id, text) => {
                if (jsonBody.stream) {
                    // send message delta
                    res.write(createEvent("content_block_delta", {
                        type: "content_block_delta",
                        index: 0,
                        delta: { type: "text_delta", text: text },
                    }));
                } else {
                    // Send final response once
                    res.write(JSON.stringify({
                        id: id,
                        content: [
                            { text: text },
                            { id: "string", name: "string", input: {} },
                        ],
                        model: proxyModel,
                        stop_reason: "end_turn",
                        stop_sequence: null,
                        usage: { input_tokens: 0, output_tokens: 0 },
                    }));
                    res.end();
                }
            });

            completion.on("end", () => {
                if (jsonBody.stream) {
                    res.write(createEvent("content_block_stop", { type: "content_block_stop", index: 0 }));
                    res.write(createEvent("message_delta", {
                        type: "message_delta",
                        delta: { stop_reason: "end_turn", stop_sequence: null },
                        usage: { output_tokens: 12 },
                    }));
                    res.write(createEvent("message_stop", { type: "message_stop" }));
                    res.end();
                }
            });

            res.on("close", () => {
                console.log(" > [Client closed]");
                completion.removeAllListeners();
                cancel();
            });

        } catch (error) {
            console.error(error);
            const errorMessage = "Error occurred, please check the log.\\n\\nAn error occurred, please check the log: <pre>" + (error.stack || error) + "</pre>";
            if (jsonBody.stream) {
                res.write(createEvent("content_block_delta", {
                    type: "content_block_delta",
                    index: 0,
                    delta: { type: "text_delta", text: errorMessage },
                }));
            } else {
                res.write(JSON.stringify({
                    id: uuidv4(),
                    content: [{ text: errorMessage }, { id: "string", name: "string", input: {} }],
                    model: proxyModel,
                    stop_reason: "error",
                    stop_sequence: null,
                    usage: { input_tokens: 0, output_tokens: 0 },
                }));
            }
            res.end();
        }
    });
});

// Helper function: Normalize message format
function anthropicNormalizeMessages(messages) {
    return messages.map(message => {
        if (typeof message.content === 'string') {
            return message;
        } else if (Array.isArray(message.content)) {
            // New version format, extract text content
            const textContent = message.content
                .filter(item => item.type === 'text')
                .map(item => item.text)
                .join('\n');
            return { ...message, content: textContent };
        } else {
            // Unknown format, return original message
            console.warn('Unknown message format:', message);
            return message;
        }
    });
}


// handle other
app.use((req, res, next) => {
    const { revision, branch } = getGitRevision();
    res.status(404).send("Not Found (YouChat_Proxy " + revision + "@" + branch + ")");
    console.log("Received a request with an incorrect path, please check if the API endpoint you are using is correct.")
});

const createLocaltunnel = async (port, subdomain) => {
    const tunnelOptions = { port };
    if (subdomain) {
        tunnelOptions.subdomain = subdomain;
    }

    try {
        const tunnel = await localtunnel(tunnelOptions);
        console.log(`Tunnel successfully created, accessible via: ${tunnel.url}/v1`);
        tunnel.on("close", () => console.log("Tunnel closed"));
        return tunnel;
    } catch (error) {
        console.error("Failed to create localtunnel:", error);
    }
};

const createNgrok = async (port, authToken, customDomain, subdomain) => {
    const ngrokOptions = { addr: port, authtoken: authToken };

    if (customDomain) {
        ngrokOptions.hostname = customDomain;
    } else if (subdomain) {
        ngrokOptions.subdomain = subdomain;
    }

    const originalHttpProxy = process.env.HTTP_PROXY;
    const originalHttpsProxy = process.env.HTTPS_PROXY;
    delete process.env.HTTP_PROXY;
    delete process.env.HTTPS_PROXY;

    try {
        const url = await ngrok.connect(ngrokOptions);
        console.log(`Tunnel successfully created, accessible via: ${url}/v1`);
        process.on('SIGTERM', async () => {
            await ngrok.kill();
            console.log("Tunnel closed");
        });
        return url;
    } catch (error) {
        console.error("Failed to create ngrok tunnel:", error);
    } finally {
        if (originalHttpProxy) process.env.HTTP_PROXY = originalHttpProxy;
        if (originalHttpsProxy) process.env.HTTPS_PROXY = originalHttpsProxy;
    }
};

const createTunnel = async (tunnelType, port) => {
    console.log(`Creating ${tunnelType} tunnel...`);
    if (tunnelType === "localtunnel") {
        return createLocaltunnel(port, process.env.SUBDOMAIN);
    } else if (tunnelType === "ngrok") {
        return createNgrok(port, process.env.NGROK_AUTH_TOKEN, process.env.NGROK_CUSTOM_DOMAIN, process.env.SUBDOMAIN);
    }
};

app.listen(port, async () => {
    console.log(`YouChat proxy listening on port ${port}`);
    if (!validApiKey) {
        console.log(`Proxy is currently running with no authentication`);
    }
    console.log(`Custom mode: ${process.env.USE_CUSTOM_MODE === "true" ? "enabled" : "disabled"}`);
    console.log(`Mode rotation: ${process.env.ENABLE_MODE_ROTATION === "true" ? "enabled" : "disabled"}`);

    if (process.env.ENABLE_TUNNEL === "true") {
        const tunnelType = process.env.TUNNEL_TYPE || "localtunnel";
        await createTunnel(tunnelType, port);
    }
});

function AnthropicApiKeyAuth(req, res, next) {
    const reqApiKey = req.header("x-api-key");

    if (validApiKey && reqApiKey !== validApiKey) {
        // If Environment variable PASSWORD is set AND x-api-key header is not equal to it, return 401
        const clientIpAddress = req.headers["x-forwarded-for"] || req.ip;
        console.log(`Receviced Request from IP ${clientIpAddress} but got invalid password.`);
        return res.status(401).json({ error: "Invalid Password" });
    }

    next();
}

function OpenAIApiKeyAuth(req, res, next) {
    const reqApiKey = req.header("Authorization");

    if (validApiKey && reqApiKey !== "Bearer " + validApiKey) {
        // If Environment variable PASSWORD is set AND Authorization header is not equal to it, return 401
        const clientIpAddress = req.headers["x-forwarded-for"] || req.ip;
        console.log(`Receviced Request from IP ${clientIpAddress} but got invalid password.`);
        return res.status(401).json({ error: { code: 403, message: "Invalid Password" } });
    }

    next();
}

// Path: cookieUtils.mjs
class ClientState {
    #closed = false;

    setClosed(value) {
        this.#closed = Boolean(value);
    }

    isClosed() {
        return this.#closed;
    }
}

export const clientState = new ClientState();