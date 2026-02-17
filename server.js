import express from "express";
import { v4 as uuidv4 } from "uuid";

const app = express();
const port = process.env.DEBUG_PORT || 8080;

// Middleware to parse JSON and strings
app.use(express.json());
app.use(express.text({ type: "*/*" }));

// CORS and Headers Middleware
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,Content-Type,Authorization,x-api-key");
    res.setHeader("Access-Control-Allow-Credentials", "true");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }
    next();
});

// Audit Middleware (kept logging)
app.use((req, res, next) => {
    console.log("\x1b[36m%s\x1b[0m", `\n================================================================================`);
    console.log("\x1b[35m%s\x1b[0m", `[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log("\x1b[36m%s\x1b[0m", `================================================================================`);

    console.log("\x1b[33m%s\x1b[0m", "--- HEADERS ---");
    console.log(JSON.stringify(req.headers, null, 2));

    console.log("\x1b[33m%s\x1b[0m", "\n--- BODY ---");
    if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
        console.log(JSON.stringify(req.body, null, 2));
    } else if (req.body) {
        console.log(req.body);
    } else {
        console.log("(Empty Body)");
    }

    console.log("\x1b[36m%s\x1b[0m", `================================================================================\n`);
    next();
});

// Mock OpenAI Models Endpoint
app.get("/v1/models", (req, res) => {
    res.json({
        object: "list",
        data: [
            { id: "gpt-4", object: "model", created: 1687882411, owned_by: "openai" },
            { id: "gpt-3.5-turbo", object: "model", created: 1677610602, owned_by: "openai" }
        ]
    });
});

// Mock OpenAI Chat Completions Endpoint
app.post("/v1/chat/completions", (req, res) => {
    const isStream = req.body && req.body.stream;

    if (isStream) {
        res.setHeader("Content-Type", "text/event-stream;charset=utf-8");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.setHeader("X-Accel-Buffering", "no");

        const id = `chatcmpl-${uuidv4()}`;
        const model = req.body.model || "gpt-4";

        // 1. Send start chunk (role)
        const startChunk = {
            id,
            object: "chat.completion.chunk",
            created: Math.floor(Date.now() / 1000),
            model,
            system_fingerprint: "fp_audit",
            choices: [{
                index: 0,
                delta: { role: "assistant", content: "" },
                finish_reason: null
            }]
        };
        res.write(`data: ${JSON.stringify(startChunk)}\n\n`);

        // 2. Send content chunk
        const contentChunk = {
            id,
            object: "chat.completion.chunk",
            created: Math.floor(Date.now() / 1000),
            model,
            system_fingerprint: "fp_audit",
            choices: [{
                index: 0,
                delta: { content: "Auditing request... I am the local audit server. Your request was received correctly." },
                finish_reason: null
            }]
        };
        res.write(`data: ${JSON.stringify(contentChunk)}\n\n`);

        // 3. Send end chunk
        const endChunk = {
            id,
            object: "chat.completion.chunk",
            created: Math.floor(Date.now() / 1000),
            model,
            choices: [{
                index: 0,
                delta: {},
                finish_reason: "stop"
            }]
        };
        res.write(`data: ${JSON.stringify(endChunk)}\n\n`);
        res.write("data: [DONE]\n\n");
        res.end();
    } else {
        res.json({
            id: `chatcmpl-${uuidv4()}`,
            object: "chat.completion",
            created: Math.floor(Date.now() / 1000),
            model: req.body.model || "gpt-4",
            choices: [{
                index: 0,
                message: {
                    role: "assistant",
                    content: "Auditing request... I am the local audit server. Your request was received correctly."
                },
                finish_reason: "stop"
            }],
            usage: {
                prompt_tokens: 10,
                completion_tokens: 10,
                total_tokens: 20
            }
        });
    }
});

// Mock Anthropic Messages Endpoint
app.post("/v1/messages", (req, res) => {
    const isStream = req.body && req.body.stream;

    if (isStream) {
        res.setHeader("Content-Type", "text/event-stream");

        const id = uuidv4();

        res.write(`event: message_start\ndata: ${JSON.stringify({
            type: "message_start",
            message: { id: id, type: "message", role: "assistant", content: [], model: req.body.model, stop_reason: null, stop_sequence: null, usage: { input_tokens: 1, output_tokens: 1 } }
        })}\n\n`);

        res.write(`event: content_block_start\ndata: ${JSON.stringify({
            type: "content_block_start",
            index: 0,
            content_block: { type: "text", text: "" }
        })}\n\n`);

        res.write(`event: content_block_delta\ndata: ${JSON.stringify({
            type: "content_block_delta",
            index: 0,
            delta: { type: "text_delta", text: "This is a mock Anthropic response." }
        })}\n\n`);

        res.write(`event: message_stop\ndata: ${JSON.stringify({ type: "message_stop" })}\n\n`);
        res.end();
    } else {
        res.json({
            id: uuidv4(),
            type: "message",
            role: "assistant",
            content: [{ type: "text", text: "This is a mock Anthropic response." }],
            model: req.body.model || "claude-3",
            stop_reason: "end_turn",
            usage: { input_tokens: 10, output_tokens: 10 }
        });
    }
});

// Catch-all for any other path to log and audit
app.all("*", (req, res) => {
    res.status(200).json({
        message: "Audit server received your request",
        path: req.url,
        method: req.method
    });
});

app.listen(port, () => {
    console.log("\x1b[32m%s\x1b[0m", `\nAudit Server is running on http://localhost:${port}`);
    console.log(`Pointing your integration to this server will log all incoming headers, bodies, and URLs.`);
});
