import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { createUmiInstance } from "./services/metaplex.js";
import { ToolName, ToolResult } from "./types/tools.js";
import {
  GetGenesisAccountSchema,
  GetGenesisAccountByMintSchema,
  GetBucketSchema,
  GetDepositSchema,
  GetCurrentPriceSchema,
  GetSwapQuoteSchema,
  ListGenesisAccountsSchema,
  CreateGenesisAccountSchema,
  SwapSchema,
} from "./types/schemas.js";
import {
  getGenesisAccount,
  getGenesisAccountByMint,
  listGenesisAccounts,
} from "./tools/accounts.js";
import {
  getBondingCurve,
  getLaunchPool,
  getPresale,
  getVault,
} from "./tools/buckets.js";
import {
  getLaunchPoolDeposit,
  getPresaleDeposit,
  getVaultDeposit,
} from "./tools/deposits.js";
import { getCurrentPriceTool, getSwapQuote } from "./tools/trading.js";
import { createGenesisAccount, swap } from "./tools/transactions.js";

type ToolInput = Tool["inputSchema"];

const DEFAULT_RPC_URL = "https://api.mainnet-beta.solana.com";

export const createServer = (rpcUrl: string = DEFAULT_RPC_URL) => {
  const umi = createUmiInstance(rpcUrl);

  const server = new Server(
    {
      name: "metaplex-genesis-mcp",
      title: "Metaplex Genesis MCP Server",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  const toolDefinitions: Tool[] = [
    {
      name: ToolName.GET_GENESIS_ACCOUNT,
      description: "Fetch a Genesis account by its public key address",
      inputSchema: zodToJsonSchema(GetGenesisAccountSchema) as ToolInput,
    },
    {
      name: ToolName.GET_GENESIS_ACCOUNT_BY_MINT,
      description: "Fetch a Genesis account by its base token mint address",
      inputSchema: zodToJsonSchema(GetGenesisAccountByMintSchema) as ToolInput,
    },
    {
      name: ToolName.GET_BONDING_CURVE,
      description: "Fetch a bonding curve bucket for a Genesis account",
      inputSchema: zodToJsonSchema(GetBucketSchema) as ToolInput,
    },
    {
      name: ToolName.GET_LAUNCH_POOL,
      description: "Fetch a launch pool bucket for a Genesis account",
      inputSchema: zodToJsonSchema(GetBucketSchema) as ToolInput,
    },
    {
      name: ToolName.GET_PRESALE,
      description: "Fetch a presale bucket for a Genesis account",
      inputSchema: zodToJsonSchema(GetBucketSchema) as ToolInput,
    },
    {
      name: ToolName.GET_VAULT,
      description: "Fetch a vault bucket for a Genesis account",
      inputSchema: zodToJsonSchema(GetBucketSchema) as ToolInput,
    },
    {
      name: ToolName.GET_LAUNCH_POOL_DEPOSIT,
      description: "Fetch a user's launch pool deposit",
      inputSchema: zodToJsonSchema(GetDepositSchema) as ToolInput,
    },
    {
      name: ToolName.GET_PRESALE_DEPOSIT,
      description: "Fetch a user's presale deposit",
      inputSchema: zodToJsonSchema(GetDepositSchema) as ToolInput,
    },
    {
      name: ToolName.GET_VAULT_DEPOSIT,
      description: "Fetch a user's vault deposit",
      inputSchema: zodToJsonSchema(GetDepositSchema) as ToolInput,
    },
    {
      name: ToolName.GET_CURRENT_PRICE,
      description: "Get the current price on a bonding curve",
      inputSchema: zodToJsonSchema(GetCurrentPriceSchema) as ToolInput,
    },
    {
      name: ToolName.GET_SWAP_QUOTE,
      description: "Get a swap quote including fees for a bonding curve trade",
      inputSchema: zodToJsonSchema(GetSwapQuoteSchema) as ToolInput,
    },
    {
      name: ToolName.SWAP,
      description: "Create a swap transaction (returns base64 transaction)",
      inputSchema: zodToJsonSchema(SwapSchema) as ToolInput,
    },
    {
      name: ToolName.LIST_GENESIS_ACCOUNTS,
      description:
        "List Genesis accounts, optionally filtered by authority or base mint",
      inputSchema: zodToJsonSchema(ListGenesisAccountsSchema) as ToolInput,
    },
    {
      name: ToolName.CREATE_GENESIS_ACCOUNT,
      description:
        "Create a transaction to initialize a new Genesis account (returns base64 transaction)",
      inputSchema: zodToJsonSchema(CreateGenesisAccountSchema) as ToolInput,
    },
  ];

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: toolDefinitions,
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      let result: ToolResult;

      switch (name) {
        case ToolName.GET_GENESIS_ACCOUNT:
          result = await getGenesisAccount(umi, args);
          break;
        case ToolName.GET_GENESIS_ACCOUNT_BY_MINT:
          result = await getGenesisAccountByMint(umi, args);
          break;
        case ToolName.GET_BONDING_CURVE:
          result = await getBondingCurve(umi, args);
          break;
        case ToolName.GET_LAUNCH_POOL:
          result = await getLaunchPool(umi, args);
          break;
        case ToolName.GET_PRESALE:
          result = await getPresale(umi, args);
          break;
        case ToolName.GET_VAULT:
          result = await getVault(umi, args);
          break;
        case ToolName.GET_LAUNCH_POOL_DEPOSIT:
          result = await getLaunchPoolDeposit(umi, args);
          break;
        case ToolName.GET_PRESALE_DEPOSIT:
          result = await getPresaleDeposit(umi, args);
          break;
        case ToolName.GET_VAULT_DEPOSIT:
          result = await getVaultDeposit(umi, args);
          break;
        case ToolName.GET_CURRENT_PRICE:
          result = await getCurrentPriceTool(umi, args);
          break;
        case ToolName.GET_SWAP_QUOTE:
          result = await getSwapQuote(umi, args);
          break;
        case ToolName.SWAP:
          result = await swap(umi, args);
          break;
        case ToolName.LIST_GENESIS_ACCOUNTS:
          result = await listGenesisAccounts(umi, args);
          break;
        case ToolName.CREATE_GENESIS_ACCOUNT:
          result = await createGenesisAccount(umi, args);
          break;
        default:
          throw new Error(`Unknown tool: ${name}`);
      }

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text", text: `Error: ${message}` }],
        isError: true,
      };
    }
  });

  return { server };
};
