# AgentRouter for OpenCode

Use [AgentRouter](https://agentrouter.org) models (like DeepSeek V4 Pro) directly in [OpenCode](https://opencode.ai) via a local OpenAI-compatible proxy server.

## How it works

AgentRouter provides an OpenAI-compatible API, but OpenCode expects providers to be configured through its `@ai-sdk/openai-compatible` adapter. This proxy bridges the gap:

1. The proxy server runs locally and exposes an OpenAI-compatible API on `http://127.0.0.1:4000`
2. Incoming chat completion requests are relayed to AgentRouter's API with streaming enabled
3. OpenCode is configured to point to this local proxy as a custom provider

```
OpenCode  -->  Local Proxy (:4000)  -->  AgentRouter API
```

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- An API key from [AgentRouter](https://agentrouter.org)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure your API key

Copy the example environment file and add your AgentRouter API key:

```bash
cp .env.example .env
```

Edit `.env` and set your key:

```
AGENTROUTER_API_KEY=sk-your-actual-key-here
```

> **Security note:** The `.env` file is listed in `.gitignore` so your key will never be committed.

### 3. Start the proxy

```bash
npm start
```

You should see:

```
AgentRouter proxy running on http://127.0.0.1:4000
```

### 4. Configure OpenCode

Copy the `opencode.jsonc` file to your OpenCode config directory:

| Platform | Location |
|----------|----------|
| Windows | `C:\Users\<you>\.opencode\opencode.jsonc` |
| macOS/Linux | `~/.opencode/opencode.jsonc` |

Or merge the `provider` section into your existing OpenCode configuration.

## Usage

Once the proxy is running and OpenCode is configured, you can select **AgentRouter** as your provider in OpenCode and use the **deepseek v4 pro** model.

### Verify the proxy is working

```bash
curl http://127.0.0.1:4000/
# {"status":"ok","message":"AgentRouter Roo Proxy Running"}

curl http://127.0.0.1:4000/v1/models
# {"object":"list","data":[{"id":"deepseek-v4-pro",...}]}
```

## Project structure

```
├── server.js          # Proxy server
├── opencode.jsonc     # OpenCode provider config
├── package.json       # Dependencies and scripts
├── .env.example       # Environment variable template
├── .gitignore
└── README.md
```

## Configuration reference

### `server.js`

| Environment variable | Default | Description |
|---------------------|---------|-------------|
| `AGENTROUTER_API_KEY` | — | Your AgentRouter API key (required) |
| `PORT` | `4000` | Port for the local proxy |

### `opencode.jsonc`

The configuration registers a custom provider named `agentrouter` in OpenCode using the `@ai-sdk/openai-compatible` adapter. It connects to the local proxy at `http://127.0.0.1:4000/v1` and exposes the `deepseek-v4-pro` model.

## License

MIT
