<p align="center">
  <img src="https://opencode.ai/favicon.ico" width="48" alt="OpenCode" />
  <span style="font-size: 2rem; margin: 0 8px;">+</span>
  <span style="font-size: 2rem; font-weight: bold; color: #6366f1;">AgentRouter</span>
</p>

<h1 align="center">AgentRouter for OpenCode</h1>

<p align="center">
  <b>Use AgentRouter models (DeepSeek V4 Pro) in OpenCode</b>
  <br />
  via a lightweight, local OpenAI-compatible proxy.
</p>

<p align="center">
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js" alt="Node" /></a>
  <a href="https://opencode.ai"><img src="https://img.shields.io/badge/opencode-ready-6366f1" alt="OpenCode" /></a>
  <a href="https://agentrouter.org"><img src="https://img.shields.io/badge/powered%20by-agentrouter-ff6b6b" alt="AgentRouter" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="License" /></a>
</p>

---

## Table of Contents

- [How it works](#how-it-works)
- [Quick start](#quick-start)
- [Setup](#setup)
- [Usage](#usage)
- [Project structure](#project-structure)
- [Configuration](#configuration)
- [Customization](#customization)
- [License](#license)

---
<img width="543" height="372" alt="Screenshot 2026-05-19 013943" src="https://github.com/user-attachments/assets/360288cd-1931-4ed4-b2b8-6347e5132e30" />

## How it works

AgentRouter offers an OpenAI-compatible API, but OpenCode needs providers registered through its `@ai-sdk/openai-compatible` adapter. This proxy bridges the two:

```
┌──────────┐     OpenAI-compat      ┌──────────────┐     AgentRouter API     ┌─────────────┐
│ OpenCode │  ──────────────────>   │ Local Proxy  │  ───────────────────>   │ AgentRouter │
│          │  <──────────────────   │  :4000       │  <───────────────────   │             │
└──────────┘    SSE stream back     └──────────────┘      stream relay       └─────────────┘
```

1. **Proxy** starts locally and exposes an OpenAI-compatible REST API
2. **OpenCode** is configured with `@ai-sdk/openai-compatible` pointing to the proxy
3. Chat requests are streamed through the proxy → AgentRouter → back to OpenCode

---
## Setup

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- An API key from [AgentRouter](https://agentrouter.org) (free tier available)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure your API key

```bash
cp .env.example .env
```

Open `.env` and set your key:

```ini
AGENTROUTER_API_KEY=sk-your-actual-key-here
```

> **Security note:** `.env` is in `.gitignore` so your key stays private.

### 3. Start the proxy

```bash
npm start
```

Expected output:

```
AgentRouter proxy running on http://127.0.0.1:4000
```

### 4. Configure OpenCode

Place the `opencode.jsonc` file in your OpenCode config directory:

| Platform | Config path |
|----------|-------------|
| Windows | `C:\Users\<you>\.opencode\opencode.jsonc` |
| macOS / Linux | `~/.opencode/opencode.jsonc` |

You can also merge the `provider` section into your existing `opencode.jsonc`.

---

## Usage

Once everything is running, select **AgentRouter** as your provider in OpenCode and pick the **deepseek v4 pro** model.

### Verify the proxy

```bash
curl http://127.0.0.1:4000/
```

```json
{ "status": "ok", "message": "AgentRouter Roo Proxy Running" }
```

```bash
curl http://127.0.0.1:4000/v1/models
```

```json
{ "object": "list", "data": [{ "id": "deepseek-v4-pro", ... }] }
```

---

## Project structure

```
├── server.js           # Proxy server (the core)
├── opencode.jsonc      # OpenCode provider configuration
├── package.json        # Dependencies and scripts
├── .env.example        # Environment variable template
├── .gitignore
└── README.md
```

---

## Configuration

### `server.js`

| Variable | Default | Description |
|----------|---------|-------------|
| `AGENTROUTER_API_KEY` | — | Your AgentRouter API key **(required)** |
| `PORT` | `4000` | Port to run the proxy on |

### `opencode.jsonc`

Registers a custom provider named `agentrouter` using OpenCode's `@ai-sdk/openai-compatible` adapter. It connects to `http://127.0.0.1:4000/v1` and exposes the `deepseek-v4-pro` model.

---

## Customization

Here are the most common changes you'll want to make:

### Change the model

Edit `opencode.jsonc` to use a different model from AgentRouter:

```jsonc
"models": {
  "deepseek-v4-pro": {
    "name": "deepseek v4 pro",
    "id": "deepseek-v4-pro"
  }
  // Add more models here
}
```

Replace the `id` and `name` with whatever model AgentRouter supports.

### Add multiple models

You can register several models in the same provider:

```jsonc
"models": {
  "deepseek-v4-pro": {
    "name": "deepseek v4 pro",
    "id": "deepseek-v4-pro"
  },
  "claude-sonnet-4": {
    "name": "claude sonnet 4",
    "id": "claude-sonnet-4"
  }
}
```

### Change the proxy port

Set a different port via environment variable:

```bash
# .env
PORT=5000
```

Or pass it inline:

```bash
PORT=5000 npm start
```

### Change the API key

Update the `AGENTROUTER_API_KEY` value in `.env`:

```ini
AGENTROUTER_API_KEY=sk-your-new-key
```

No need to restart the proxy if you're using `npm run dev` (auto-reloads).

### Point to a different API base URL

If AgentRouter changes their endpoint, update `server.js:13`:

```js
baseURL: "https://agentrouter.org/v1",
```

---

## Contact

- **Telegram:** [@Jvlock](https://t.me/Jvlock)
- **Email:** [faresnoser0@gmail.com](mailto:faresnoser0@gmail.com)

Feel free to reach out for questions, suggestions, or feedback.

---

## License

[MIT](./LICENSE)
