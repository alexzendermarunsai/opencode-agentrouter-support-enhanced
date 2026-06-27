<p align="center">
  <a href="https://opencode.ai/">
    <img
      width="234"
      height="42"
      alt="OpenCode"
      src="https://github.com/user-attachments/assets/9c5d41a3-c331-4676-81a3-916cef69441b"
      style="vertical-align: middle;"
    />
  </a>

  <span style="font-size: 2rem; margin: 0 14px; vertical-align: middle;">
    +
  </span>

  <a href="https://agentrouter.org/">
    <img
      src="https://github.com/user-attachments/assets/5a4f6e27-bf2e-4cbe-82a6-3837cb9f2a4c"
      height="70"
      alt="AgentRouter"
      style="vertical-align: middle;"
    />
  </a>
</p>

<h1 align="center">AgentRouter for OpenCode</h1>

<p align="center">
  <b>Use AgentRouter models in OpenCode</b>
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
- [Setup](#setup)
- [Usage](#usage)
- [Project structure](#project-structure)
- [Configuration](#configuration)
- [Customization](#customization)
- [License](#license)

---
<img width="1439" height="801" alt="Screenshot 2026-06-07 113032" src="https://github.com/user-attachments/assets/913c63a7-7f7f-496e-98e0-9193ab08731c" />


---
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

### 1. Clone or download the files

Place both `agenrouter_server.js` and `opencode.jsonc` in the same directory — preferably your OpenCode config directory (`C:\Users\<you>\.config\opencode\`). Keeping them together makes management easier.

### 2. Install dependencies

```bash
npm install express cors openai dotenv
```

### 3. Configure your API key

Copy the `.env.example` file to `.env` and add your API key:

```bash
cp .env.example .env
```

Edit `.env` and replace `your-api-key-here` with your actual API key:

```
AGENTROUTER_API_KEY=sk-your-actual-key-here
```

### 4. Start the proxy

```bash
node agenrouter_server.js
```

Expected output:

```
AgentRouter proxy running on http://127.0.0.1:4000
```

### 5. Configure OpenCode

Place the `opencode.jsonc` file in your OpenCode config directory (or keep it there if you already placed both files together in step 1):

| Platform | Config path |
|----------|-------------|
| Windows | `C:\Users\<you>\.config\opencode\opencode.jsonc` |
| macOS / Linux | `~/.opencode/opencode.jsonc` |

You can also merge the `provider` section into your existing `opencode.jsonc`.

---

## Usage

Once everything is running, select **AgentRouter** as your provider in OpenCode and pick one of the available models:
- **claude-opus-4-6** - Claude Opus 4.6
- **claude-opus-4-7** - Claude Opus 4.7
- **claude-opus-4-8** - Claude Opus 4.8
- **gpt-5.5** - GPT-5.5
- **glm-5.2** - GLM-5.2

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

Returns live models from agentrouter API (claude-opus-4-6, claude-opus-4-7, claude-opus-4-8, gpt-5.5, glm-5.2).

---

## Project structure

```
├── agenrouter_server.js   # Proxy server (the core)
├── .env.example           # API key template
├── .env                   # Your API key (not committed)
├── .gitignore             # Prevents committing secrets
├── package.json           # Dependencies
├── package-lock.json      # Lockfile
├── opencode.jsonc         # OpenCode provider configuration
├── LICENSE
└── README.md
```

---

## Configuration

### `agenrouter_server.js`

| Variable | Location | Description |
|----------|----------|-------------|
| `apiKey` | Line 12 | Reads from `process.env.AGENTROUTER_API_KEY` |
| `PORT` | Line 100 | Port to run the proxy on (default: `4000`) |
| `baseURL` | Line 13 | AgentRouter API base URL |

### `.env`

| Variable | Description |
|----------|-------------|
| `AGENTROUTER_API_KEY` | Your AgentRouter API key **(required)** |

### `opencode.jsonc`

Registers a custom provider named `agentrouter` using OpenCode's `@ai-sdk/openai-compatible` adapter. It connects to `http://127.0.0.1:4000/v1` and exposes the following models:

| Model ID | Display Name |
|----------|-------------|
| `claude-opus-4-6` | Claude Opus 4.6 |
| `claude-opus-4-7` | Claude Opus 4.7 |
| `claude-opus-4-8` | Claude Opus 4.8 |
| `gpt-5.5` | GPT-5.5 |
| `glm-5.2` | GLM-5.2 |

---

## Customization

### Change the proxy port

Only needed if port **4000** is already in use. Edit line 100 in `agenrouter_server.js`:

```js
const PORT = 5000; // change to any available port
```

Then update the `baseURL` in `opencode.jsonc` to match the new port.

### Point to a different API base URL

If AgentRouter changes their endpoint, update `agenrouter_server.js:13`:

```js
baseURL: "https://agentrouter.org/v1",
```

---

## Recent Updates

### v1.1.0 (2026-06-27)
- **Security:** Replaced hardcoded API key with dotenv environment variables
- **Dynamic Models:** `/v1/models` now proxies live models from agentrouter API
- **Error Handling:** Added request validation, stream chunk validation, and structured error responses
- **Package Management:** Added `package.json` and `package-lock.json`
- **Git Hygiene:** Added `.gitignore` to prevent committing secrets
- **Available Models:** Updated to support claude-opus-4-6, claude-opus-4-7, claude-opus-4-8, gpt-5.5, and glm-5.2

### v1.0.0 (Original)
- Initial release with basic proxy server
- Hardcoded API key configuration
- Static model list (deepseek-v4-pro, deepseek-v4-flash, glm-5.1)

---

## Credits

This project is an enhanced fork of [opencode-agentrouter-support](https://github.com/Fares-Nosair/opencode-agentrouter-support) by [Fares Nosair](https://github.com/Fares-Nosair).

Original work provided the foundation for this improved version with:
- Basic proxy server implementation
- OpenCode provider configuration
- Initial documentation

---

## License

[MIT](./LICENSE)
