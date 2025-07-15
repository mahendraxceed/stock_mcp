#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import type { IBroker } from "./brokers/broker.interface.js";
import { UpstoxBroker } from "./brokers/upstox/client.js";
import { RupeezyBroker } from "./brokers/rupeezy/client.js";
import { PortfolioService } from "./services/portfolio.service.js";
import { MarketService } from "./services/market.service.js";
import { FundsService } from "./services/funds.service.js";
import { AnalysisService } from "./services/analysis.service.js";
import { registerAllTools } from "./tools/register-all.js";
import { logger } from "./utils/logger.js";

async function main() {
  const config = loadConfig();

  // Initialize broker adapters
  const brokers = new Map<string, IBroker>();

  if (config.upstox.accessToken) {
    brokers.set("upstox", new UpstoxBroker(config.upstox));
  }

  if (config.rupeezy.accessToken) {
    brokers.set("rupeezy", new RupeezyBroker(config.rupeezy));
  }

  if (brokers.size === 0) {
    logger.warn(
      "No broker tokens configured. Set UPSTOX_ACCESS_TOKEN or RUPEEZY_ACCESS_TOKEN in your environment."
    );
  }

  // Initialize services
  const services = {
    portfolio: new PortfolioService(brokers),
    market: new MarketService(brokers),
    funds: new FundsService(brokers),
    analysis: new AnalysisService(brokers),
  };

  // Create MCP server
  const server = new McpServer({
    name: "stock-mcp",
    version: "1.0.0",
  });

  // Register all tools
  registerAllTools(server, services);

  // Connect via stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info("Stock MCP server running on stdio");
}

main().catch((err) => {
  logger.error("Fatal error:", err);
  process.exit(1);
});
