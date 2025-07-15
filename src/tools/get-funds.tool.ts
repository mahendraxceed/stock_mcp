import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { FundsService } from "../services/funds.service.js";

export function registerGetFunds(
  server: McpServer,
  funds: FundsService
): void {
  server.registerTool(
    "get_funds",
    {
      title: "Get Account Funds & Margin",
      description:
        "Get account balance, available margin, used margin, and collateral info " +
        "from your brokerage accounts.",
      inputSchema: z.object({
        broker: z
          .enum(["upstox", "rupeezy", "all"])
          .default("all")
          .describe("Which broker to fetch funds from."),
      }),
    },
    async ({ broker }) => {
      try {
        const result = await funds.getFunds(broker);
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
