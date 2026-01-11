import express, { type Express, type Request, type Response } from "express";
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
import { renderDashboard } from "./dashboard.js";
import { logger } from "./utils/logger.js";

export function createApp(config: AppConfig): Express {
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

  // ─── REST API for Tool Testing ──────────────────────────────────────

  function getServices() {
    return {
      portfolio: new PortfolioService(brokers),
      market: new MarketService(brokers),
      funds: new FundsService(brokers),
      analysis: new AnalysisService(brokers),
    };
  }

  app.get("/api/portfolio", async (req: Request, res: Response) => {
    try {
      const broker = (req.query.broker as string) || "all";
      const s = getServices();
      const holdings = await s.portfolio.getHoldings(broker as any);
      const totalInvested = holdings.reduce((s, h) => s + h.investedValue, 0);
      const currentValue = holdings.reduce((s, h) => s + h.currentValue, 0);
      res.json({
        totalHoldings: holdings.length,
        totalInvested: Math.round(totalInvested * 100) / 100,
        currentValue: Math.round(currentValue * 100) / 100,
        totalPnl: Math.round((currentValue - totalInvested) * 100) / 100,
        holdings,
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/positions", async (req: Request, res: Response) => {
    try {
      const broker = (req.query.broker as string) || "all";
      const s = getServices();
      const positions = await s.portfolio.getPositions(broker as any);
      res.json({ totalPositions: positions.length, positions });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/funds", async (req: Request, res: Response) => {
    try {
      const broker = (req.query.broker as string) || "all";
      const s = getServices();
      const funds = await s.funds.getFunds(broker as any);
      res.json(funds);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/analysis", async (req: Request, res: Response) => {
    try {
      const broker = (req.query.broker as string) || "all";
      const s = getServices();
      const result = await s.analysis.analyzePortfolio(broker as any);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/quote", async (req: Request, res: Response) => {
    try {
      const instruments = ((req.query.instruments as string) || "").split(",").filter(Boolean);
      const broker = (req.query.broker as string) || "upstox";
      if (!instruments.length) {
        res.status(400).json({ error: "instruments parameter required" });
        return;
      }
      const s = getServices();
      const quotes = await s.market.getQuotes(instruments, broker as any);
      res.json(quotes);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/history", async (req: Request, res: Response) => {
    try {
      const instrument = req.query.instrument as string;
      const interval = (req.query.interval as string) || "day";
      const from = req.query.from as string;
      const to = req.query.to as string;
      const broker = (req.query.broker as string) || "upstox";
      if (!instrument || !from || !to) {
        res.status(400).json({ error: "instrument, from, and to parameters required" });
        return;
      }
      const s = getServices();
      const candles = await s.market.getHistoricalData(instrument, interval, from, to, broker as any);
      res.json({ totalCandles: candles.length, candles });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
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
    res.send(
      renderDashboard({
        port: config.port,
        upstox: brokers.has("upstox"),
        rupeezy: brokers.has("rupeezy"),
        sessions: transports.size,
      })
    );
  });

  return app;
}
