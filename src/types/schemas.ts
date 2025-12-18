import { z } from "zod";

export const GetGenesisAccountSchema = z.object({
  address: z.string().describe("The public key address of the genesis account"),
});

export const GetGenesisAccountByMintSchema = z.object({
  baseMint: z.string().describe("The public key of the base token mint"),
  genesisIndex: z
    .number()
    .default(0)
    .describe("The index of the genesis account (default: 0)"),
});

export const GetBucketSchema = z.object({
  genesisAccount: z.string().describe("The public key of the genesis account"),
  bucketIndex: z
    .number()
    .default(0)
    .describe("The index of the bucket (default: 0)"),
});

export const GetDepositSchema = z.object({
  bucketAddress: z.string().describe("The public key of the bucket"),
  recipient: z.string().describe("The public key of the recipient wallet"),
});

export const GetCurrentPriceSchema = z.object({
  bondingCurveBucket: z
    .string()
    .describe("The public key of the bonding curve bucket"),
});

export const ListGenesisAccountsSchema = z.object({
  authority: z
    .string()
    .optional()
    .describe("Optional: Filter by authority public key"),
  baseMint: z
    .string()
    .optional()
    .describe("Optional: Filter by base token mint"),
});

export const GetSwapQuoteSchema = z.object({
  bondingCurveBucket: z
    .string()
    .describe("The public key of the bonding curve bucket"),
  amountIn: z
    .string()
    .describe("The input amount as a string (in lamports/base units)"),
  direction: z
    .enum(["Buy", "Sell"])
    .describe(
      "Swap direction: 'Buy' (SOL to tokens) or 'Sell' (tokens to SOL)",
    ),
});

export const SwapSchema = z.object({
  bondingCurveBucket: z
    .string()
    .describe("The public key of the bonding curve bucket"),
  amountIn: z
    .string()
    .describe("The input amount as a string (in lamports/base units)"),
  minAmountOut: z
    .string()
    .describe(
      "The minimum output amount as a string (for slippage protection)",
    ),
  direction: z
    .enum(["Buy", "Sell"])
    .describe(
      "Swap direction: 'Buy' (SOL to tokens) or 'Sell' (tokens to SOL)",
    ),
  authority: z
    .string()
    .describe("The public key of the authority (user wallet)"),
});

export const CreateGenesisAccountSchema = z.object({
  baseMint: z.string().describe("The public key of the base token mint"),
  totalSupplyBaseToken: z
    .string()
    .describe("The total supply of base tokens as a string"),
  name: z.string().describe("The name of the token/genesis"),
  uri: z.string().describe("The metadata URI"),
  symbol: z.string().describe("The symbol of the token"),
  fundingMode: z
    .enum(["Mint", "Transfer"])
    .default("Mint")
    .describe("Funding mode: 'Mint' (0) or 'Transfer' (1)"),
  authority: z
    .string()
    .optional()
    .describe("Optional: The authority public key (defaults to payer)"),
  payer: z
    .string()
    .optional()
    .describe("Optional: The payer public key (defaults to authority)"),
});

export type GetGenesisAccountInput = z.infer<typeof GetGenesisAccountSchema>;
export type GetGenesisAccountByMintInput = z.infer<
  typeof GetGenesisAccountByMintSchema
>;
export type GetBucketInput = z.infer<typeof GetBucketSchema>;
export type GetDepositInput = z.infer<typeof GetDepositSchema>;
export type GetCurrentPriceInput = z.infer<typeof GetCurrentPriceSchema>;
export type ListGenesisAccountsInput = z.infer<
  typeof ListGenesisAccountsSchema
>;
export type GetSwapQuoteInput = z.infer<typeof GetSwapQuoteSchema>;
export type SwapInput = z.infer<typeof SwapSchema>;
export type CreateGenesisAccountInput = z.infer<
  typeof CreateGenesisAccountSchema
>;
