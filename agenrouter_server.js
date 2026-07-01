const express = require("express");
const cors = require("cors");
const { timingSafeEqual } = require("crypto");
const OpenAI = require("openai");
require("dotenv").config();

const PROXY_API_KEY = process.env.PROXY_API_KEY;

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Optional Bearer token auth for /v1 endpoints (skip if PROXY_API_KEY not set)
app.use("/v1", (req, res, next) => {
  if (!PROXY_API_KEY) return next();
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: { message: "Unauthorized", type: "auth_error", code: 401 } });
  }
  const key = auth.slice(7);
  if (key.length !== PROXY_API_KEY.length || !timingSafeEqual(Buffer.from(key), Buffer.from(PROXY_API_KEY))) {
    return res.status(401).json({ error: { message: "Unauthorized", type: "auth_error", code: 401 } });
  }
  next();
});

const client = new OpenAI({
  apiKey: process.env.AGENTROUTER_API_KEY,
  baseURL: "https://agentrouter.org/v1",

  defaultHeaders: {
    "HTTP-Referer": "https://github.com/RooVetGit/Roo-Cline",
    "X-Title": "Roo Code",
    "User-Agent": "RooCode/3.54.0",

    "X-Stainless-Arch": "x64",
    "X-Stainless-Lang": "js",
    "X-Stainless-OS": "Windows",
    "X-Stainless-Package-Version": "5.12.2",
    "X-Stainless-Retry-Count": "0",
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": process.version
  }
});

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "AgentRouter Roo Proxy Running"
  });
});

app.get("/v1/models", async (req, res) => {
  try {
    const response = await client.models.list();
    res.json(response);
  } catch (err) {
    console.error("Models Error:", err);
    res.status(err.status || 500).json({
      error: true,
      message: err.message
    });
  }
});

app.post("/v1/chat/completions", async (req, res) => {
  try {
    if (!req.body || !req.body.messages) {
      return res.status(400).json({
        error: {
          message: "Invalid request body: missing messages",
          type: "invalid_request_error",
          code: 400
        }
      });
    }

    const body = {
      ...req.body,
      stream: true
    };

    const stream = await client.chat.completions.create(body);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    for await (const chunk of stream) {
      if (chunk) {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();

  } catch (err) {
    console.error("Proxy Error:", err);

    if (!res.headersSent) {
      res.status(err.status || 500).json({
        error: {
          message: err.message || "Internal proxy error",
          type: err.type || "proxy_error",
          code: err.status || 500
        }
      });
    } else {
      res.write(`data: ${JSON.stringify({ error: { message: err.message } })}\n\n`);
      res.end();
    }
  }
});

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`AgentRouter proxy running on http://127.0.0.1:${PORT}`);
});
