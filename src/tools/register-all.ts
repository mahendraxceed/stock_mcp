import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { PortfolioService } from "../services/portfolio.service.js";
import type { MarketService } from "../services/market.service.js";
import type { FundsService } from "../services/funds.service.js";
import type { AnalysisService } from "../services/analysis.service.js";
import { registerGetPortfolio } from "./get-portfolio.tool.js";
import { registerGetPositions } from "./get-positions.tool.js";
import { registerGetStockQuote } from "./get-stock-quote.tool.js";
import { registerGetHistoricalData } from "./get-historical-data.tool.js";
import { registerAnalyzePortfolio } from "./analyze-portfolio.tool.js";
import { registerGetFunds } from "./get-funds.tool.js";

export interface ServiceContainer {
  portfolio: PortfolioService;
  market: MarketService;
  funds: FundsService;
  analysis: AnalysisService;
}

export function registerAllTools(
  server: McpServer,
  services: ServiceContainer
): void {
  registerGetPortfolio(server, services.portfolio);
  registerGetPositions(server, services.portfolio);
  registerGetStockQuote(server, services.market);
  registerGetHistoricalData(server, services.market);
  registerAnalyzePortfolio(server, services.analysis);
  registerGetFunds(server, services.funds);
}
