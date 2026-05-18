const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));

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

app.get("/v1/models", (req, res) => {
  res.json({
    object: "list",
    data: [
      {
        id: "deepseek-v4-pro",
        object: "model",
        created: Date.now(),
        owned_by: "agentrouter"
      }
    ]
  });
});

app.post("/v1/chat/completions", async (req, res) => {
  try {
    const body = {
      ...req.body,
      stream: true
    };

    const stream = await client.chat.completions.create(body);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }

    res.write("data: [DONE]\n\n");
    res.end();

  } catch (err) {
    console.error("Proxy Error:", err);

    res.status(err.status || 500).json({
      error: true,
      message: err.message,
      details: err.error || null
    });
  }
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`AgentRouter proxy running on http://127.0.0.1:${PORT}`);
});
