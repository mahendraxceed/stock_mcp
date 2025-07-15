import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AnalysisService } from "../services/analysis.service.js";

export function registerAnalyzePortfolio(
  server: McpServer,
  analysis: AnalysisService
): void {
  server.registerTool(
    "analyze_portfolio",
    {
      title: "Analyze Portfolio",
      description:
        "Perform comprehensive portfolio analysis across all brokers. " +
        "Returns: total P&L, top gainers/losers, concentration risk, " +
        "diversification score (0-100), and broker-wise breakdown.",
      inputSchema: z.object({
        broker: z
          .enum(["upstox", "rupeezy", "all"])
          .default("all")
          .describe("Which broker to analyze."),
        include_positions: z
          .boolean()
          .default(false)
          .describe("Include open positions in analysis alongside holdings."),
      }),
    },
    async ({ broker, include_positions }) => {
      try {
        const result = await analysis.analyzePortfolio(broker, include_positions);
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return {
          content: [{ type: "text" as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    }
  );
}
