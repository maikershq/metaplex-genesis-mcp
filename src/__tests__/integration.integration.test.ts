import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";

interface TextContent {
  type: "text";
  text: string;
}

interface CallToolResult {
  content: TextContent[];
  isError?: boolean;
}

describe("MCP Server Integration", () => {
  let client: Client;
  let transport: StdioClientTransport;

  beforeAll(async () => {
    const serverPath = path.join(process.cwd(), "dist/index.js");
    
    transport = new StdioClientTransport({
      command: "node",
      args: [serverPath],
      env: {
        ...process.env,
        SOLANA_RPC_URL: "https://api.mainnet-beta.solana.com",
      },
      stderr: "pipe",
    });

    client = new Client(
      { name: "test-client", version: "1.0.0" },
      { capabilities: {} }
    );

    await client.connect(transport);
  }, 15000);

  afterAll(async () => {
    await client?.close();
  });

  describe("Server Connection", () => {
    it("connects successfully and returns server info", () => {
      const serverInfo = client.getServerVersion();
      expect(serverInfo).toBeDefined();
      expect(serverInfo?.name).toBe("metaplex-genesis-mcp");
    });
  });

  describe("tools/list", () => {
    it("returns all 12 tools", async () => {
      const result = await client.listTools();
      
      expect(result.tools).toHaveLength(12);
      expect(result.tools.map(t => t.name)).toContain("get_genesis_account");
      expect(result.tools.map(t => t.name)).toContain("get_swap_quote");
    });

    it("each tool has valid schema", async () => {
      const result = await client.listTools();
      
      for (const tool of result.tools) {
        expect(tool.name).toBeTruthy();
        expect(tool.description).toBeTruthy();
        expect(tool.inputSchema).toBeDefined();
        expect(tool.inputSchema.type).toBe("object");
      }
    });
  });

  describe("tools/call - Error Handling", () => {
    it("returns error for unknown tool", async () => {
      const result = await client.callTool({
        name: "nonexistent_tool",
        arguments: {},
      }) as CallToolResult;

      expect(result.isError).toBe(true);
      expect(result.content[0]).toHaveProperty("text");
      expect(result.content[0].text).toContain("Unknown tool");
    });

    it("returns error for missing required params", async () => {
      const result = await client.callTool({
        name: "get_genesis_account",
        arguments: {},
      }) as CallToolResult;

      expect(result.isError).toBe(true);
    });
  });

  describe("tools/call - Real RPC (mainnet)", () => {
    it("handles non-existent account gracefully", async () => {
      const result = await client.callTool({
        name: "get_genesis_account",
        arguments: { address: "11111111111111111111111111111111" },
      }) as CallToolResult;

      // May return "not found" or an error about wrong account type
      const text = result.content[0].text;
      const isHandled = text.includes("not found") || text.includes("Error") || result.isError;
      expect(isHandled).toBe(true);
    });

    it("handles invalid public key format", async () => {
      const result = await client.callTool({
        name: "get_genesis_account",
        arguments: { address: "invalid-pubkey-format" },
      }) as CallToolResult;

      expect(result.isError).toBe(true);
    });
  });

  describe("tools/call - Swap Quote Validation", () => {
    it("rejects invalid swap direction", async () => {
      const result = await client.callTool({
        name: "get_swap_quote",
        arguments: {
          bondingCurveBucket: "11111111111111111111111111111111",
          amountIn: "1000000",
          direction: "InvalidDirection",
        },
      }) as CallToolResult;

      expect(result.isError).toBe(true);
    });
  });
});
