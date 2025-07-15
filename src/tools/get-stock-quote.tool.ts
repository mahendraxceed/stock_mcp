import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MarketService } from "../services/market.service.js";

export function registerGetStockQuote(
  server: McpServer,
  market: MarketService
): void {
  server.registerTool(
    "get_stock_quote",
    {
      title: "Get Stock Quote",
      description:
        "Get real-time stock quote (LTP, OHLC, volume, change%) for Indian stocks. " +
        "For Upstox, provide instrument keys like 'NSE_EQ|INE002A01018'. " +
        "For Rupeezy, provide instrument keys like 'NSE_EQ-2885'.",
      inputSchema: z.object({
        instruments: z
          .array(z.string())
          .min(1)
          .max(50)
          .describe("Instrument keys in broker-specific format"),
        broker: z
          .enum(["upstox", "rupeezy"])
          .default("upstox")
          .describe("Which broker's market data to use."),
      }),
    },
    async ({ instruments, broker }) => {
      try {
        const quotes = await market.getQuotes(instruments, broker);
        return { content: [{ type: "text" as const, text: JSON.stringify(quotes, null, 2) }] };
      } catch (error) {
        return {
          content: [{ type: "text" as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    }
  );
}
