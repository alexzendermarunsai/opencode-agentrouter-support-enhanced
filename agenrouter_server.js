const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));

const client = new OpenAI({
  apiKey: "type your api key here",
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
    message: "AgentRouter Proxy Running"
  });
});

app.get("/v1/models", (req, res) => {
  res.json({
    object: "list",
    data: [
      { id: "glm-5.1",           object: "model", created: 1700000000, owned_by: "zhipu" },
      { id: "glm-4.7",           object: "model", created: 1700000000, owned_by: "zhipu" },
      { id: "glm-4.5-air",       object: "model", created: 1700000000, owned_by: "zhipu" },
      { id: "claude-opus-4-7",   object: "model", created: 1700000000, owned_by: "anthropic" },
      { id: "claude-sonnet-4-6", object: "model", created: 1700000000, owned_by: "anthropic" },
      { id: "kimi-k2.6",         object: "model", created: 1700000000, owned_by: "moonshot" },
      { id: "qwen3-coder-480b",  object: "model", created: 1700000000, owned_by: "qwen" },
      { id: "gemini-2.5-flash",  object: "model", created: 1700000000, owned_by: "google" }
    ]
  });
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
  console.log(`Proxy running on http://127.0.0.1:${PORT}`);
});
