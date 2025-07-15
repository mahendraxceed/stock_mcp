import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { PortfolioService } from "../services/portfolio.service.js";

export function registerGetPortfolio(
  server: McpServer,
  portfolio: PortfolioService
): void {
  server.registerTool(
    "get_portfolio",
    {
      title: "Get Portfolio Holdings",
      description:
        "Fetch long-term stock holdings from your Indian brokerage accounts (Upstox/Rupeezy). " +
        "Returns each holding with symbol, quantity, average price, current price, P&L, and invested value.",
      inputSchema: z.object({
        broker: z
          .enum(["upstox", "rupeezy", "all"])
          .default("all")
          .describe("Which broker to fetch holdings from. Defaults to all."),
      }),
    },
    async ({ broker }) => {
      try {
        const holdings = await portfolio.getHoldings(broker);
        const summary = {
          totalHoldings: holdings.length,
          totalInvested: round(holdings.reduce((s, h) => s + h.investedValue, 0)),
          currentValue: round(holdings.reduce((s, h) => s + h.currentValue, 0)),
          totalPnl: round(holdings.reduce((s, h) => s + h.pnl, 0)),
          holdings: holdings.map((h) => ({
            symbol: h.tradingSymbol,
            exchange: h.exchange,
            broker: h.broker,
            qty: h.quantity,
            avgPrice: h.averagePrice,
            ltp: h.lastPrice,
            currentValue: round(h.currentValue),
            investedValue: round(h.investedValue),
            pnl: round(h.pnl),
            pnlPercent: round(h.pnlPercent),
          })),
        };
        return { content: [{ type: "text" as const, text: JSON.stringify(summary, null, 2) }] };
      } catch (error) {
        return {
          content: [{ type: "text" as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    }
  );
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
