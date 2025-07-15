# Stock MCP Server

MCP (Model Context Protocol) server for Indian stock market data. Connects to **Upstox** and **Rupeezy** broker APIs to fetch portfolio data, market quotes, and historical data — enabling AI-powered portfolio analysis via Claude Code and Cursor.

## Features

- **Multi-broker support** — Upstox & Rupeezy with unified data format
- **6 MCP tools** for portfolio, positions, quotes, historical data, funds & analysis
- **Portfolio analysis** — P&L, top gainers/losers, concentration risk, diversification score
- **stdio transport** — works with Claude Code, Cursor, and any MCP-compatible client

## Tools

| Tool | Description |
|------|-------------|
| `get_portfolio` | Fetch long-term holdings from Upstox/Rupeezy/both |
| `get_positions` | Fetch current open intraday & delivery positions |
| `get_stock_quote` | Real-time stock quote (LTP, OHLC, volume, change%) |
| `get_historical_data` | Historical OHLCV candle data (1min to monthly) |
| `analyze_portfolio` | P&L summary, top gainers/losers, diversification score, concentration risk |
| `get_funds` | Account balance, available margin, used margin, collateral |

## Setup

### 1. Install & Build

```bash
pnpm install
pnpm build
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

```env
# Upstox (https://account.upstox.com/developer/apps)
UPSTOX_API_KEY=your_client_id
UPSTOX_API_SECRET=your_client_secret
UPSTOX_ACCESS_TOKEN=your_access_token

# Rupeezy (https://vortex.rupeezy.in/login)
RUPEEZY_APPLICATION_ID=your_app_id
RUPEEZY_API_SECRET=your_api_secret
RUPEEZY_ACCESS_TOKEN=your_access_token
```

You only need to configure the broker(s) you use. At least one access token is required.

### 3. Get Access Tokens

**Upstox:**
1. Create an app at [account.upstox.com/developer/apps](https://account.upstox.com/developer/apps)
2. Open: `https://api.upstox.com/v2/login/authorization/dialog?client_id=YOUR_API_KEY&redirect_uri=YOUR_REDIRECT_URI&response_type=code`
3. Login and capture the `code` from the redirect URL
4. Exchange for token: `POST https://api.upstox.com/v2/login/authorization/token`
5. Token is valid until 3:30 AM the next day

**Rupeezy:**
1. Register at [vortex.rupeezy.in/login](https://vortex.rupeezy.in/login)
2. Open: `https://flow.rupeezy.in?applicationId=YOUR_APP_ID`
3. Login and capture the `auth` token from the callback URL
4. Use the SDK or API to exchange for an access token

## Usage

### Claude Code

```bash
claude mcp add --transport stdio stock-mcp -- node /path/to/stock_mcp/dist/index.js
```

With environment variables:

```bash
claude mcp add --transport stdio \
  --env UPSTOX_ACCESS_TOKEN=xxx \
  --env RUPEEZY_ACCESS_TOKEN=xxx \
  --env RUPEEZY_APPLICATION_ID=xxx \
  --env RUPEEZY_API_SECRET=xxx \
  stock-mcp -- node /path/to/stock_mcp/dist/index.js
```

Then ask Claude: *"Show my portfolio holdings"* or *"Analyze my portfolio diversification"*

### Cursor

Add to `.cursor/mcp.json` in your project:

```json
{
  "mcpServers": {
    "stock-mcp": {
      "command": "node",
      "args": ["/path/to/stock_mcp/dist/index.js"],
      "env": {
        "UPSTOX_ACCESS_TOKEN": "...",
        "RUPEEZY_ACCESS_TOKEN": "...",
        "RUPEEZY_APPLICATION_ID": "...",
        "RUPEEZY_API_SECRET": "..."
      }
    }
  }
}
```

### MCP Inspector (for testing)

```bash
pnpm inspect
```

## Instrument Key Formats

Each broker uses a different instrument key format:

| Broker | Format | Example (Reliance) |
|--------|--------|--------------------|
| Upstox | `{EXCHANGE}_{SEGMENT}\|{ISIN}` | `NSE_EQ\|INE002A01018` |
| Rupeezy | `{EXCHANGE}_{SEGMENT}-{TOKEN}` | `NSE_EQ-2885` |

## Project Structure

```
src/
├── index.ts                  # Entry point
├── config.ts                 # Environment config
├── types/                    # Unified type definitions
├── brokers/
│   ├── broker.interface.ts   # IBroker contract
│   ├── upstox/               # Upstox adapter (upstox-js-sdk)
│   └── rupeezy/              # Rupeezy adapter (@rupeezy/jsvortex)
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
- `@modelcontextprotocol/sdk` — MCP server framework
- `upstox-js-sdk` — Upstox API client
- `@rupeezy/jsvortex` — Rupeezy API client
- `zod` — Schema validation

## License

ISC
