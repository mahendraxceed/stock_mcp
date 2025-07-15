import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { PortfolioService } from "../services/portfolio.service.js";

export function registerGetPositions(
  server: McpServer,
  portfolio: PortfolioService
): void {
  server.registerTool(
    "get_positions",
    {
      title: "Get Open Positions",
      description:
        "Fetch current open intraday and delivery positions from your brokerage accounts. " +
        "Returns each position with symbol, product type, quantity, P&L, and day change.",
      inputSchema: z.object({
        broker: z
          .enum(["upstox", "rupeezy", "all"])
          .default("all")
          .describe("Which broker to fetch positions from."),
      }),
    },
    async ({ broker }) => {
      try {
        const positions = await portfolio.getPositions(broker);
        const summary = {
          totalPositions: positions.length,
          totalPnl: round(positions.reduce((s, p) => s + p.pnl, 0)),
          positions: positions.map((p) => ({
            symbol: p.tradingSymbol,
            exchange: p.exchange,
            broker: p.broker,
            product: p.product,
            qty: p.quantity,
            avgPrice: p.averagePrice,
            ltp: p.lastPrice,
            pnl: round(p.pnl),
            buyValue: round(p.buyValue),
            sellValue: round(p.sellValue),
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
