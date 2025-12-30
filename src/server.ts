import express from "express";
import type { Request, Response } from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import type { AppConfig } from "./config.js";
import type { IBroker } from "./brokers/broker.interface.js";
import { UpstoxBroker } from "./brokers/upstox/client.js";
import { RupeezyBroker } from "./brokers/rupeezy/client.js";
import { getUpstoxAuthUrl, exchangeUpstoxToken } from "./brokers/upstox/auth.js";
import { getRupeezyAuthUrl, exchangeRupeezyToken } from "./brokers/rupeezy/auth.js";
import { PortfolioService } from "./services/portfolio.service.js";
import { MarketService } from "./services/market.service.js";
import { FundsService } from "./services/funds.service.js";
import { AnalysisService } from "./services/analysis.service.js";
import { registerAllTools } from "./tools/register-all.js";
import { logger } from "./utils/logger.js";

export function createApp(config: AppConfig) {
  const app = express();
  app.use(express.json());

  // Shared state
  const brokers = new Map<string, IBroker>();
  const transports = new Map<string, SSEServerTransport>();

  // Initialize brokers from env tokens if present
  if (config.upstox.accessToken) {
    brokers.set("upstox", new UpstoxBroker(config.upstox));
  }
  if (config.rupeezy.accessToken) {
    brokers.set("rupeezy", new RupeezyBroker(config.rupeezy));
  }

  // Helper to build MCP server with current brokers
  function createMcpServer(): McpServer {
    const services = {
      portfolio: new PortfolioService(brokers),
      market: new MarketService(brokers),
      funds: new FundsService(brokers),
      analysis: new AnalysisService(brokers),
    };

    const server = new McpServer({
      name: "stock-mcp",
      version: "1.0.0",
    });

    registerAllTools(server, services);
    return server;
  }

  // ─── MCP SSE Endpoints ─────────────────────────────────────────────

  app.get("/sse", async (req: Request, res: Response) => {
    try {
      const transport = new SSEServerTransport("/messages", res);
      const sessionId = transport.sessionId;
      transports.set(sessionId, transport);

      transport.onclose = () => {
        transports.delete(sessionId);
        logger.info(`SSE session ${sessionId} closed`);
      };

      const server = createMcpServer();
      await server.connect(transport);
      logger.info(`SSE session ${sessionId} established`);
    } catch (error) {
      logger.error("SSE connection error:", error);
      if (!res.headersSent) {
        res.status(500).send("SSE connection failed");
      }
    }
  });

  app.post("/messages", async (req: Request, res: Response) => {
    const sessionId = req.query.sessionId as string;
    const transport = transports.get(sessionId);

    if (!transport) {
      res.status(404).send("Session not found");
      return;
    }

    await transport.handlePostMessage(req, res, req.body);
  });

  // ─── Upstox OAuth ──────────────────────────────────────────────────

  app.get("/auth/upstox", (req: Request, res: Response) => {
    if (!config.upstox.apiKey) {
      res.status(400).send("UPSTOX_API_KEY not configured");
      return;
    }
    const url = getUpstoxAuthUrl(config.upstox);
    res.redirect(url);
  });

  app.get("/auth/upstox/callback", async (req: Request, res: Response) => {
    const code = req.query.code as string;
    if (!code) {
      res.status(400).send("Missing authorization code");
      return;
    }

    try {
      const accessToken = await exchangeUpstoxToken(code, config.upstox);
      config.upstox.accessToken = accessToken;
      brokers.set("upstox", new UpstoxBroker(config.upstox));
      res.send(
        "<h2>Upstox connected successfully!</h2>" +
        '<p><a href="/">Back to dashboard</a></p>'
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      res.status(500).send(`<h2>Upstox auth failed</h2><p>${msg}</p>`);
    }
  });

  // ─── Rupeezy OAuth ─────────────────────────────────────────────────

  app.get("/auth/rupeezy", (req: Request, res: Response) => {
    if (!config.rupeezy.applicationId) {
      res.status(400).send("RUPEEZY_APPLICATION_ID not configured");
      return;
    }
    const url = getRupeezyAuthUrl(config.rupeezy);
    res.redirect(url);
  });

  app.get("/auth/rupeezy/callback", async (req: Request, res: Response) => {
    const authCode = (req.query.auth ?? req.query.code ?? req.query.token) as string;
    if (!authCode) {
      res.status(400).send("Missing auth token");
      return;
    }

    try {
      const accessToken = await exchangeRupeezyToken(authCode, config.rupeezy);
      config.rupeezy.accessToken = accessToken;
      brokers.set("rupeezy", new RupeezyBroker(config.rupeezy));
      res.send(
        "<h2>Rupeezy connected successfully!</h2>" +
        '<p><a href="/">Back to dashboard</a></p>'
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      res.status(500).send(`<h2>Rupeezy auth failed</h2><p>${msg}</p>`);
    }
  });

  // ─── Status & Dashboard ────────────────────────────────────────────

  app.get("/auth/status", (req: Request, res: Response) => {
    res.json({
      brokers: {
        upstox: brokers.has("upstox") ? "connected" : "disconnected",
        rupeezy: brokers.has("rupeezy") ? "connected" : "disconnected",
      },
      activeSessions: transports.size,
    });
  });

  app.get("/", (req: Request, res: Response) => {
    const upstoxStatus = brokers.has("upstox");
    const rupeezyStatus = brokers.has("rupeezy");

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Stock MCP Server</title>
        <style>
          body { font-family: system-ui, sans-serif; max-width: 600px; margin: 40px auto; padding: 0 20px; }
          .status { display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin-right: 8px; }
          .connected { background: #22c55e; }
          .disconnected { background: #ef4444; }
          .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 12px 0; }
          a.btn { display: inline-block; padding: 8px 16px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; }
          a.btn:hover { background: #2563eb; }
          code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 14px; }
        </style>
      </head>
      <body>
        <h1>Stock MCP Server</h1>

        <div class="card">
          <h3>
            <span class="status ${upstoxStatus ? "connected" : "disconnected"}"></span>
            Upstox — ${upstoxStatus ? "Connected" : "Not connected"}
          </h3>
          ${upstoxStatus
            ? "<p>Broker is active.</p>"
            : '<a class="btn" href="/auth/upstox">Connect Upstox</a>'}
        </div>

        <div class="card">
          <h3>
            <span class="status ${rupeezyStatus ? "connected" : "disconnected"}"></span>
            Rupeezy — ${rupeezyStatus ? "Connected" : "Not connected"}
          </h3>
          ${rupeezyStatus
            ? "<p>Broker is active.</p>"
            : '<a class="btn" href="/auth/rupeezy">Connect Rupeezy</a>'}
        </div>

        <div class="card">
          <h3>MCP Endpoint</h3>
          <p>SSE: <code>http://localhost:${config.port}/sse</code></p>
          <p>Connect via: <code>npx mcp-remote http://localhost:${config.port}/sse</code></p>
        </div>

        <div class="card">
          <h3>Active SSE Sessions: ${transports.size}</h3>
        </div>
      </body>
      </html>
    `);
  });

  return app;
}
