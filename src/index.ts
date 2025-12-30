#!/usr/bin/env node

import { loadConfig } from "./config.js";
import { createApp } from "./server.js";
import { logger } from "./utils/logger.js";

function main() {
  const config = loadConfig();
  const app = createApp(config);

  app.listen(config.port, () => {
    logger.info(`Stock MCP server running on http://localhost:${config.port}`);
    logger.info(`Dashboard: http://localhost:${config.port}`);
    logger.info(`MCP SSE endpoint: http://localhost:${config.port}/sse`);
    logger.info(
      `Connect via: npx mcp-remote http://localhost:${config.port}/sse`
    );
  });
}

main();
