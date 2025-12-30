# Stock MCP Server

MCP (Model Context Protocol) server for Indian stock market data. Connects to **Upstox** and **Rupeezy** broker APIs to fetch portfolio data, market quotes, and historical data — enabling AI-powered portfolio analysis via Claude Code and Cursor.

## Features

- **Multi-broker support** — Upstox & Rupeezy with unified data format
- **Built-in OAuth** — authorize brokers via browser, no manual token copying
- **6 MCP tools** for portfolio, positions, quotes, historical data, funds & analysis
- **Portfolio analysis** — P&L, top gainers/losers, concentration risk, diversification score
- **Express + SSE transport** — works with Claude Code, Cursor via `mcp-remote`
- **Web dashboard** — view broker status and auth links at `http://localhost:3001`

## Tools

| Tool | Description |
|------|-------------|
| `get_portfolio` | Fetch long-term holdings from Upstox/Rupeezy/both |
| `get_positions` | Fetch current open intraday & delivery positions |
| `get_stock_quote` | Real-time stock quote (LTP, OHLC, volume, change%) |
| `get_historical_data` | Historical OHLCV candle data (1min to monthly) |
| `analyze_portfolio` | P&L summary, top gainers/losers, diversification score, concentration risk |
| `get_funds` | Account balance, available margin, used margin, collateral |

## Quick Start

### 1. Install & Build

```bash
pnpm install
pnpm build
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Fill in your broker API credentials (keys/secrets only — access tokens are obtained via OAuth):

```env
PORT=3001

# Upstox (https://account.upstox.com/developer/apps)
UPSTOX_API_KEY=your_client_id
UPSTOX_API_SECRET=your_client_secret

# Rupeezy (https://vortex.rupeezy.in/login)
RUPEEZY_APPLICATION_ID=your_app_id
RUPEEZY_API_SECRET=your_api_secret
```

### 3. Start the Server

```bash
node dist/index.js
```

Server starts at `http://localhost:3001`.

### 4. Authorize Brokers

Open `http://localhost:3001` in your browser. Click **Connect Upstox** or **Connect Rupeezy** to authorize via OAuth. After login, the broker is active immediately.

### 5. Connect AI Client

Add to your Claude Code or Cursor MCP config:

```json
{
  "mcpServers": {
    "stock-mcp": {
      "command": "npx",
      "args": ["mcp-remote", "http://localhost:3001/sse"]
    }
  }
}
```

Then ask Claude: *"Show my portfolio holdings"* or *"Analyze my portfolio diversification"*

## Auth Flow

```
1. Start server: node dist/index.js
2. Open http://localhost:3001 in browser
3. Click "Connect Upstox" -> login at Upstox -> redirected back -> broker active
4. Click "Connect Rupeezy" -> login at Rupeezy -> redirected back -> broker active
5. AI client connects via: npx mcp-remote http://localhost:3001/sse
6. Claude/Cursor calls tools using live broker tokens
```

**Token Notes:**
- Upstox tokens are valid until 3:30 AM the next day
- Re-authorize daily by visiting the dashboard
- You can also set `UPSTOX_ACCESS_TOKEN` / `RUPEEZY_ACCESS_TOKEN` in `.env` as fallback

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Dashboard with broker status and auth links |
| `/sse` | GET | MCP SSE stream (for mcp-remote) |
| `/messages` | POST | MCP message handler |
| `/auth/upstox` | GET | Start Upstox OAuth flow |
| `/auth/upstox/callback` | GET | Upstox OAuth callback |
| `/auth/rupeezy` | GET | Start Rupeezy OAuth flow |
| `/auth/rupeezy/callback` | GET | Rupeezy OAuth callback |
| `/auth/status` | GET | JSON broker connection status |

## Instrument Key Formats

Each broker uses a different instrument key format:

| Broker | Format | Example (Reliance) |
|--------|--------|--------------------|
| Upstox | `{EXCHANGE}_{SEGMENT}\|{ISIN}` | `NSE_EQ\|INE002A01018` |
| Rupeezy | `{EXCHANGE}_{SEGMENT}-{TOKEN}` | `NSE_EQ-2885` |

## Project Structure

```
src/
├── index.ts                  # Entry point — starts Express server
├── server.ts                 # Express app with SSE + OAuth routes
├── config.ts                 # Environment config
├── types/                    # Unified type definitions
├── brokers/
│   ├── broker.interface.ts   # IBroker contract
│   ├── upstox/
│   │   ├── client.ts         # Upstox adapter (upstox-js-sdk)
│   │   ├── mapper.ts         # Response mappers
│   │   └── auth.ts           # OAuth URL + token exchange
│   └── rupeezy/
│       ├── client.ts         # Rupeezy adapter (@rupeezy/jsvortex)
│       ├── mapper.ts         # Response mappers
│       └── auth.ts           # OAuth URL + token exchange
├── services/                 # Business logic layer
│   ├── portfolio.service.ts
│   ├── market.service.ts
│   ├── funds.service.ts
│   └── analysis.service.ts
├── tools/                    # MCP tool definitions
└── utils/                    # Logger, cache, rate limiter
```

## Tech Stack

- TypeScript + ESM
- Express — HTTP server with SSE transport
- `@modelcontextprotocol/sdk` — MCP server framework
- `upstox-js-sdk` — Upstox API client
- `@rupeezy/jsvortex` — Rupeezy API client
- `zod` — Schema validation

## License

ISC
