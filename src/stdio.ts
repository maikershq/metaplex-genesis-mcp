#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";

const RPC_URL =
  process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";

async function main() {
  console.error("Starting Metaplex Genesis MCP Server (STDIO)...");
  console.error(`Using RPC: ${RPC_URL}`);

  const transport = new StdioServerTransport();
  const { server } = createServer(RPC_URL);

  server.onclose = async () => {
    process.exit(0);
  };

  await server.connect(transport);

  process.on("SIGINT", async () => {
    await server.close();
  });
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
