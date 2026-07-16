#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { setupJsonConsole } from "./utils/console.js";
import { CreateUiTool } from "./tools/create-ui.js";
import { FetchUiTool } from "./tools/fetch-ui.js";
import { LogoSearchTool } from "./tools/logo-search.js";
import { RefineUiTool } from "./tools/refine-ui.js";

setupJsonConsole();

const VERSION = "1.0.0";
const server = new McpServer({
  name: "21st-magic",
  version: VERSION,
});

new CreateUiTool().register(server);
new LogoSearchTool().register(server);
new FetchUiTool().register(server);
new RefineUiTool().register(server);

async function runServer() {
  const transport = new StdioServerTransport();

  let isShuttingDown = false;

  const cleanup = () => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    try {
      transport.close();
    } catch (error) {
      console.error("Error closing transport:", error);
    }
    process.exit(0);
  };

  transport.onerror = (error: Error) => {
    console.error("Transport error:", error);
    cleanup();
  };

  transport.onclose = () => {
    console.error("Transport closed unexpectedly");
    cleanup();
  };

  process.on("SIGTERM", cleanup);
  process.on("SIGINT", cleanup);
  process.on("beforeExit", cleanup);

  await server.connect(transport);
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
