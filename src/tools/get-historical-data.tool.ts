import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MarketService } from "../services/market.service.js";

export function registerGetHistoricalData(
  server: McpServer,
  market: MarketService
): void {
  server.registerTool(
    "get_historical_data",
    {
      title: "Get Historical Candle Data",
      description:
        "Fetch historical OHLCV (Open, High, Low, Close, Volume) candle data for a stock. " +
        "For Upstox, use instrument key like 'NSE_EQ|INE002A01018'. " +
        "For Rupeezy, use instrument key like 'NSE_EQ-2885'.",
      inputSchema: z.object({
        instrument: z
          .string()
          .describe("Instrument key in broker-specific format"),
        interval: z
          .enum([
            "1minute", "5minute", "15minute", "30minute",
            "1hour", "day", "week", "month",
          ])
          .default("day")
          .describe("Candle interval."),
        from_date: z
          .string()
          .describe("Start date in YYYY-MM-DD format"),
        to_date: z
          .string()
          .describe("End date in YYYY-MM-DD format"),
        broker: z
          .enum(["upstox", "rupeezy"])
          .default("upstox")
          .describe("Which broker to use for historical data."),
      }),
    },
    async ({ instrument, interval, from_date, to_date, broker }) => {
      try {
        const candles = await market.getHistoricalData(
          instrument, interval, from_date, to_date, broker
        );
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({ totalCandles: candles.length, candles }, null, 2),
          }],
        };
      } catch (error) {
        return {
          content: [{ type: "text" as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    }
  );
}
