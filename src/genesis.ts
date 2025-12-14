import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { publicKey } from "@metaplex-foundation/umi";
import {
  safeFetchGenesisAccountV2,
  fetchBondingCurveBucketV2,
  safeFetchBondingCurveBucketV2,
  safeFetchLaunchPoolBucketV2,
  safeFetchPresaleBucketV2,
  safeFetchLaunchPoolDepositV2,
  safeFetchPresaleDepositV2,
  safeFetchVaultBucketV2,
  safeFetchVaultDepositV2,
  findGenesisAccountV2Pda,
  findBondingCurveBucketV2Pda,
  findLaunchPoolBucketV2Pda,
  findPresaleBucketV2Pda,
  findLaunchPoolDepositV2Pda,
  findPresaleDepositV2Pda,
  findVaultBucketV2Pda,
  findVaultDepositV2Pda,
  getGenesisAccountV2GpaBuilder,
  getSwapResult,
  getCurrentPrice,
  SwapDirection,
  genesis,
} from "@metaplex-foundation/genesis";

type ToolInput = Tool["inputSchema"];

const GetGenesisAccountSchema = z.object({
  address: z.string().describe("The public key address of the genesis account"),
});

const GetGenesisAccountByMintSchema = z.object({
  baseMint: z.string().describe("The public key of the base token mint"),
  genesisIndex: z.number().default(0).describe("The index of the genesis account (default: 0)"),
});

const GetBucketSchema = z.object({
  genesisAccount: z.string().describe("The public key of the genesis account"),
  bucketIndex: z.number().default(0).describe("The index of the bucket (default: 0)"),
});

const GetDepositSchema = z.object({
  bucketAddress: z.string().describe("The public key of the bucket"),
  recipient: z.string().describe("The public key of the recipient wallet"),
});

const GetCurrentPriceSchema = z.object({
  bondingCurveBucket: z.string().describe("The public key of the bonding curve bucket"),
});

const ListGenesisAccountsSchema = z.object({
  authority: z.string().optional().describe("Optional: Filter by authority public key"),
  baseMint: z.string().optional().describe("Optional: Filter by base token mint"),
});

const GetSwapQuoteSchema = z.object({
  bondingCurveBucket: z.string().describe("The public key of the bonding curve bucket"),
  amountIn: z.string().describe("The input amount as a string (in lamports/base units)"),
  direction: z.enum(["Buy", "Sell"]).describe("Swap direction: 'Buy' (SOL to tokens) or 'Sell' (tokens to SOL)"),
});

enum ToolName {
  GET_GENESIS_ACCOUNT = "get_genesis_account",
  GET_GENESIS_ACCOUNT_BY_MINT = "get_genesis_account_by_mint",
  GET_BONDING_CURVE = "get_bonding_curve",
  GET_LAUNCH_POOL = "get_launch_pool",
  GET_PRESALE = "get_presale",
  GET_VAULT = "get_vault",
  GET_LAUNCH_POOL_DEPOSIT = "get_launch_pool_deposit",
  GET_PRESALE_DEPOSIT = "get_presale_deposit",
  GET_VAULT_DEPOSIT = "get_vault_deposit",
  GET_CURRENT_PRICE = "get_current_price",
  GET_SWAP_QUOTE = "get_swap_quote",
  LIST_GENESIS_ACCOUNTS = "list_genesis_accounts",
}

function serializeBigInts(obj: unknown): unknown {
  if (typeof obj === "bigint") {
    return obj.toString();
  }
  if (Array.isArray(obj)) {
    return obj.map(serializeBigInts);
  }
  if (obj !== null && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[key] = serializeBigInts(value);
    }
    return result;
  }
  return obj;
}

function formatResponse(address: string, data: unknown): string {
  const serialized = serializeBigInts(data) as Record<string, unknown>;
  return JSON.stringify({ address, ...serialized }, null, 2);
}

export const createServer = (rpcUrl: string = "https://api.mainnet-beta.solana.com") => {
  const umi = createUmi(rpcUrl).use(genesis());
  
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
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const tools: Tool[] = [
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
        name: ToolName.LIST_GENESIS_ACCOUNTS,
        description: "List Genesis accounts, optionally filtered by authority or base mint",
        inputSchema: zodToJsonSchema(ListGenesisAccountsSchema) as ToolInput,
      },
    ];

    return { tools };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      if (name === ToolName.GET_GENESIS_ACCOUNT) {
        const { address } = GetGenesisAccountSchema.parse(args);
        const account = await safeFetchGenesisAccountV2(umi, publicKey(address));
        if (!account) {
          return {
            content: [{ type: "text", text: `Genesis account not found: ${address}` }],
          };
        }
        return {
          content: [{ type: "text", text: JSON.stringify(serializeBigInts(account), null, 2) }],
        };
      }

      if (name === ToolName.GET_GENESIS_ACCOUNT_BY_MINT) {
        const { baseMint, genesisIndex } = GetGenesisAccountByMintSchema.parse(args);
        const pda = findGenesisAccountV2Pda(umi, {
          baseMint: publicKey(baseMint),
          genesisIndex,
        });
        const account = await safeFetchGenesisAccountV2(umi, pda);
        if (!account) {
          return {
            content: [{ type: "text", text: `Genesis account not found for mint ${baseMint} at index ${genesisIndex}` }],
          };
        }
        return {
          content: [{ type: "text", text: formatResponse(pda[0], account) }],
        };
      }

      if (name === ToolName.GET_BONDING_CURVE) {
        const { genesisAccount, bucketIndex } = GetBucketSchema.parse(args);
        const pda = findBondingCurveBucketV2Pda(umi, {
          genesisAccount: publicKey(genesisAccount),
          bucketIndex,
        });
        const bucket = await safeFetchBondingCurveBucketV2(umi, pda);
        if (!bucket) {
          return {
            content: [{ type: "text", text: `Bonding curve bucket not found for genesis ${genesisAccount} at index ${bucketIndex}` }],
          };
        }
        return {
          content: [{ type: "text", text: formatResponse(pda[0], bucket) }],
        };
      }

      if (name === ToolName.GET_LAUNCH_POOL) {
        const { genesisAccount, bucketIndex } = GetBucketSchema.parse(args);
        const pda = findLaunchPoolBucketV2Pda(umi, {
          genesisAccount: publicKey(genesisAccount),
          bucketIndex,
        });
        const bucket = await safeFetchLaunchPoolBucketV2(umi, pda);
        if (!bucket) {
          return {
            content: [{ type: "text", text: `Launch pool bucket not found for genesis ${genesisAccount} at index ${bucketIndex}` }],
          };
        }
        return {
          content: [{ type: "text", text: formatResponse(pda[0], bucket) }],
        };
      }

      if (name === ToolName.GET_PRESALE) {
        const { genesisAccount, bucketIndex } = GetBucketSchema.parse(args);
        const pda = findPresaleBucketV2Pda(umi, {
          genesisAccount: publicKey(genesisAccount),
          bucketIndex,
        });
        const bucket = await safeFetchPresaleBucketV2(umi, pda);
        if (!bucket) {
          return {
            content: [{ type: "text", text: `Presale bucket not found for genesis ${genesisAccount} at index ${bucketIndex}` }],
          };
        }
        return {
          content: [{ type: "text", text: formatResponse(pda[0], bucket) }],
        };
      }

      if (name === ToolName.GET_VAULT) {
        const { genesisAccount, bucketIndex } = GetBucketSchema.parse(args);
        const pda = findVaultBucketV2Pda(umi, {
          genesisAccount: publicKey(genesisAccount),
          bucketIndex,
        });
        const bucket = await safeFetchVaultBucketV2(umi, pda);
        if (!bucket) {
          return {
            content: [{ type: "text", text: `Vault bucket not found for genesis ${genesisAccount} at index ${bucketIndex}` }],
          };
        }
        return {
          content: [{ type: "text", text: formatResponse(pda[0], bucket) }],
        };
      }

      if (name === ToolName.GET_LAUNCH_POOL_DEPOSIT) {
        const { bucketAddress, recipient } = GetDepositSchema.parse(args);
        const pda = findLaunchPoolDepositV2Pda(umi, {
          bucket: publicKey(bucketAddress),
          recipient: publicKey(recipient),
        });
        const deposit = await safeFetchLaunchPoolDepositV2(umi, pda);
        if (!deposit) {
          return {
            content: [{ type: "text", text: `Launch pool deposit not found for recipient ${recipient}` }],
          };
        }
        return {
          content: [{ type: "text", text: formatResponse(pda[0], deposit) }],
        };
      }

      if (name === ToolName.GET_PRESALE_DEPOSIT) {
        const { bucketAddress, recipient } = GetDepositSchema.parse(args);
        const pda = findPresaleDepositV2Pda(umi, {
          bucket: publicKey(bucketAddress),
          recipient: publicKey(recipient),
        });
        const deposit = await safeFetchPresaleDepositV2(umi, pda);
        if (!deposit) {
          return {
            content: [{ type: "text", text: `Presale deposit not found for recipient ${recipient}` }],
          };
        }
        return {
          content: [{ type: "text", text: formatResponse(pda[0], deposit) }],
        };
      }

      if (name === ToolName.GET_VAULT_DEPOSIT) {
        const { bucketAddress, recipient } = GetDepositSchema.parse(args);
        const pda = findVaultDepositV2Pda(umi, {
          bucket: publicKey(bucketAddress),
          recipient: publicKey(recipient),
        });
        const deposit = await safeFetchVaultDepositV2(umi, pda);
        if (!deposit) {
          return {
            content: [{ type: "text", text: `Vault deposit not found for recipient ${recipient}` }],
          };
        }
        return {
          content: [{ type: "text", text: formatResponse(pda[0], deposit) }],
        };
      }

      if (name === ToolName.GET_CURRENT_PRICE) {
        const { bondingCurveBucket } = GetCurrentPriceSchema.parse(args);
        const bucket = await fetchBondingCurveBucketV2(umi, publicKey(bondingCurveBucket));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const price = getCurrentPrice(bucket as any);
        return {
          content: [{ 
            type: "text", 
            text: JSON.stringify({ 
              price: price.toString(),
              bucketAddress: bondingCurveBucket
            }, null, 2) 
          }],
        };
      }

      if (name === ToolName.GET_SWAP_QUOTE) {
        const { bondingCurveBucket, amountIn, direction } = GetSwapQuoteSchema.parse(args);
        const bucket = await fetchBondingCurveBucketV2(umi, publicKey(bondingCurveBucket));
        const swapDirection = direction === "Buy" ? SwapDirection.Buy : SwapDirection.Sell;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = getSwapResult(bucket as any, BigInt(amountIn), swapDirection);
        return {
          content: [{ 
            type: "text", 
            text: JSON.stringify({ 
              amountIn: result.amountIn.toString(),
              fee: result.fee.toString(),
              amountOut: result.amountOut.toString(),
              direction,
              bucketAddress: bondingCurveBucket
            }, null, 2) 
          }],
        };
      }

      if (name === ToolName.LIST_GENESIS_ACCOUNTS) {
        const { authority, baseMint } = ListGenesisAccountsSchema.parse(args);
        let builder = getGenesisAccountV2GpaBuilder(umi);
        
        if (authority) {
          builder = builder.whereField("authority", publicKey(authority));
        }
        if (baseMint) {
          builder = builder.whereField("baseMint", publicKey(baseMint));
        }
        
        const accounts = await builder.get();
        const formattedAccounts = accounts.map(acc => {
          const serialized = serializeBigInts(acc) as Record<string, unknown>;
          return { address: acc.publicKey, ...serialized };
        });
        
        return {
          content: [{ 
            type: "text", 
            text: JSON.stringify({
              count: accounts.length,
              accounts: formattedAccounts
            }, null, 2) 
          }],
        };
      }

      throw new Error(`Unknown tool: ${name}`);
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
