import { describe, it, expect, vi, beforeEach } from "vitest";
import { createServer } from "../genesis.js";

vi.mock("@metaplex-foundation/umi-bundle-defaults", () => ({
  createUmi: vi.fn(() => ({
    use: vi.fn().mockReturnThis(),
  })),
}));

vi.mock("@metaplex-foundation/umi", () => ({
  publicKey: vi.fn((key: string) => key),
}));

const mockGenesisAccountData = {
  publicKey: "GenesisAccountPubkey123",
  header: { executable: false, owner: "Genesis111", lamports: BigInt(1000000) },
  key: { __kind: "GenesisAccountV2" },
  bump: 255,
  index: 0,
  finalized: false,
  padding: [],
  authority: "AuthorityPubkey123",
  baseMint: "BaseMintPubkey123",
  quoteMint: "QuoteMintPubkey123",
  totalSupplyBaseToken: BigInt("1000000000000"),
  totalAllocatedSupplyBaseToken: BigInt("500000000000"),
  totalProceedsQuoteToken: BigInt("100000000000"),
  fundingMode: 1,
  bucketCount: 3,
};

const mockBondingCurveBucketData = {
  publicKey: "BondingCurveBucketPubkey123",
  header: { executable: false, owner: "Genesis111", lamports: BigInt(1000000) },
  key: { __kind: "BondingCurveBucketV2" },
  depositFeeType: { __kind: "Flat" },
  withdrawFeeType: { __kind: "Flat" },
  bondingCurveType: { __kind: "ConstantProduct" },
  padding: [],
  depositFee: BigInt("50000"),
  withdrawFee: BigInt("50000"),
  quoteTokenDepositTotal: BigInt("10000000000"),
  bucket: {
    genesisAccount: "GenesisAccountPubkey123",
    bucketIndex: 0,
    state: { __kind: "Active" },
    allocatedSupply: BigInt("500000000000"),
    reserveSupply: BigInt("500000000000"),
  },
  swapStartCondition: { __kind: "None" },
  swapEndCondition: { __kind: "None" },
  reserved: [],
  extensions: {},
  padding2: [],
  endBehaviors: [],
  constantProductParams: {
    virtualSol: BigInt("30000000000"),
    virtualTokens: BigInt("1000000000000"),
  },
};

const mockLaunchPoolBucketData = {
  publicKey: "LaunchPoolBucketPubkey123",
  header: { executable: false, owner: "Genesis111", lamports: BigInt(1000000) },
  key: { __kind: "LaunchPoolBucketV2" },
  bucket: {
    genesisAccount: "GenesisAccountPubkey123",
    bucketIndex: 1,
    state: { __kind: "Active" },
    allocatedSupply: BigInt("100000000000"),
  },
  depositFee: BigInt("25000"),
  totalDeposits: BigInt("5000000000"),
};

const mockPresaleBucketData = {
  publicKey: "PresaleBucketPubkey123",
  header: { executable: false, owner: "Genesis111", lamports: BigInt(1000000) },
  key: { __kind: "PresaleBucketV2" },
  bucket: {
    genesisAccount: "GenesisAccountPubkey123",
    bucketIndex: 2,
    state: { __kind: "Active" },
    allocatedSupply: BigInt("200000000000"),
  },
  price: BigInt("1000000"),
  maxAllocation: BigInt("10000000000"),
};

const mockVaultBucketData = {
  publicKey: "VaultBucketPubkey123",
  header: { executable: false, owner: "Genesis111", lamports: BigInt(1000000) },
  key: { __kind: "VaultBucketV2" },
  bucket: {
    genesisAccount: "GenesisAccountPubkey123",
    bucketIndex: 3,
    state: { __kind: "Active" },
    allocatedSupply: BigInt("100000000000"),
  },
  vestingSchedule: { cliff: BigInt("86400"), duration: BigInt("2592000") },
};

const mockDepositData = {
  publicKey: "DepositPubkey123",
  header: { executable: false, owner: "Genesis111", lamports: BigInt(1000000) },
  key: { __kind: "LaunchPoolDepositV2" },
  bump: 254,
  claimed: false,
  refunded: false,
  index: 0,
  amountClaimed: BigInt("0"),
  depositor: "DepositorPubkey123",
  bucket: "LaunchPoolBucketPubkey123",
  timestamp: BigInt("1702000000"),
  amountQuoteToken: BigInt("1000000000"),
  weightedQuoteToken: BigInt("1000000000"),
};

vi.mock("@metaplex-foundation/genesis", () => ({
  genesis: vi.fn(() => ({
    install: vi.fn(),
  })),
  safeFetchGenesisAccountV2: vi.fn(),
  fetchBondingCurveBucketV2: vi.fn(),
  safeFetchBondingCurveBucketV2: vi.fn(),
  safeFetchLaunchPoolBucketV2: vi.fn(),
  safeFetchPresaleBucketV2: vi.fn(),
  safeFetchLaunchPoolDepositV2: vi.fn(),
  safeFetchPresaleDepositV2: vi.fn(),
  safeFetchVaultBucketV2: vi.fn(),
  safeFetchVaultDepositV2: vi.fn(),
  findGenesisAccountV2Pda: vi.fn(() => ["GenesisAccountPda123", 255]),
  findBondingCurveBucketV2Pda: vi.fn(() => ["BondingCurveBucketPda123", 254]),
  findLaunchPoolBucketV2Pda: vi.fn(() => ["LaunchPoolBucketPda123", 253]),
  findPresaleBucketV2Pda: vi.fn(() => ["PresaleBucketPda123", 252]),
  findLaunchPoolDepositV2Pda: vi.fn(() => ["LaunchPoolDepositPda123", 251]),
  findPresaleDepositV2Pda: vi.fn(() => ["PresaleDepositPda123", 250]),
  findVaultBucketV2Pda: vi.fn(() => ["VaultBucketPda123", 249]),
  findVaultDepositV2Pda: vi.fn(() => ["VaultDepositPda123", 248]),
  getGenesisAccountV2GpaBuilder: vi.fn(() => ({
    whereField: vi.fn().mockReturnThis(),
    get: vi.fn(),
  })),
  getSwapResult: vi.fn(),
  getCurrentPrice: vi.fn(),
  SwapDirection: { Buy: 0, Sell: 1 },
}));

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
  getGenesisAccountV2GpaBuilder,
  getSwapResult,
  getCurrentPrice,
} from "@metaplex-foundation/genesis";

describe("Genesis MCP Server", () => {
  let server: ReturnType<typeof createServer>["server"];

  beforeEach(() => {
    vi.clearAllMocks();
    const result = createServer("https://api.mainnet-beta.solana.com");
    server = result.server;
  });

  describe("createServer", () => {
    it("creates server with correct metadata", () => {
      expect(server).toBeDefined();
    });
  });

  describe("ListToolsRequest", () => {
    it("returns all available tools", async () => {
      const request = { method: "tools/list", params: {} };
      const handler = (server as any)._requestHandlers.get("tools/list");
      const result = await handler(request, {});

      expect(result.tools).toHaveLength(12);
      expect(result.tools.map((t: any) => t.name)).toEqual([
        "get_genesis_account",
        "get_genesis_account_by_mint",
        "get_bonding_curve",
        "get_launch_pool",
        "get_presale",
        "get_vault",
        "get_launch_pool_deposit",
        "get_presale_deposit",
        "get_vault_deposit",
        "get_current_price",
        "get_swap_quote",
        "list_genesis_accounts",
      ]);
    });

    it("each tool has required fields", async () => {
      const request = { method: "tools/list", params: {} };
      const handler = (server as any)._requestHandlers.get("tools/list");
      const result = await handler(request, {});

      for (const tool of result.tools) {
        expect(tool).toHaveProperty("name");
        expect(tool).toHaveProperty("description");
        expect(tool).toHaveProperty("inputSchema");
        expect(tool.inputSchema).toHaveProperty("type", "object");
      }
    });
  });

  describe("CallToolRequest", () => {
    let callHandler: any;

    beforeEach(() => {
      callHandler = (server as any)._requestHandlers.get("tools/call");
    });

    describe("get_genesis_account", () => {
      it("returns genesis account data", async () => {
        vi.mocked(safeFetchGenesisAccountV2).mockResolvedValueOnce(mockGenesisAccountData as any);

        const result = await callHandler({
          method: "tools/call",
          params: {
            name: "get_genesis_account",
            arguments: { address: "GenesisAccountPubkey123" },
          },
        }, {});

        expect(result.content[0].type).toBe("text");
        const data = JSON.parse(result.content[0].text);
        expect(data.authority).toBe("AuthorityPubkey123");
        expect(data.totalSupplyBaseToken).toBe("1000000000000");
      });

      it("returns not found message when account doesn't exist", async () => {
        vi.mocked(safeFetchGenesisAccountV2).mockResolvedValueOnce(null);

        const result = await callHandler({
          method: "tools/call",
          params: {
            name: "get_genesis_account",
            arguments: { address: "NonExistentAccount" },
          },
        }, {});

        expect(result.content[0].text).toContain("not found");
      });
    });

    describe("get_genesis_account_by_mint", () => {
      it("returns genesis account by mint", async () => {
        vi.mocked(safeFetchGenesisAccountV2).mockResolvedValueOnce(mockGenesisAccountData as any);

        const result = await callHandler({
          method: "tools/call",
          params: {
            name: "get_genesis_account_by_mint",
            arguments: { baseMint: "BaseMintPubkey123", genesisIndex: 0 },
          },
        }, {});

        const data = JSON.parse(result.content[0].text);
        expect(data.address).toBe("GenesisAccountPda123");
        expect(data.baseMint).toBe("BaseMintPubkey123");
      });
    });

    describe("get_bonding_curve", () => {
      it("returns bonding curve bucket data", async () => {
        vi.mocked(safeFetchBondingCurveBucketV2).mockResolvedValueOnce(mockBondingCurveBucketData as any);

        const result = await callHandler({
          method: "tools/call",
          params: {
            name: "get_bonding_curve",
            arguments: { genesisAccount: "GenesisAccountPubkey123", bucketIndex: 0 },
          },
        }, {});

        const data = JSON.parse(result.content[0].text);
        expect(data.address).toBe("BondingCurveBucketPda123");
        expect(data.depositFee).toBe("50000");
      });

      it("returns not found when bucket doesn't exist", async () => {
        vi.mocked(safeFetchBondingCurveBucketV2).mockResolvedValueOnce(null);

        const result = await callHandler({
          method: "tools/call",
          params: {
            name: "get_bonding_curve",
            arguments: { genesisAccount: "GenesisAccountPubkey123", bucketIndex: 99 },
          },
        }, {});

        expect(result.content[0].text).toContain("not found");
      });
    });

    describe("get_launch_pool", () => {
      it("returns launch pool bucket data", async () => {
        vi.mocked(safeFetchLaunchPoolBucketV2).mockResolvedValueOnce(mockLaunchPoolBucketData as any);

        const result = await callHandler({
          method: "tools/call",
          params: {
            name: "get_launch_pool",
            arguments: { genesisAccount: "GenesisAccountPubkey123", bucketIndex: 1 },
          },
        }, {});

        const data = JSON.parse(result.content[0].text);
        expect(data.address).toBe("LaunchPoolBucketPda123");
      });
    });

    describe("get_presale", () => {
      it("returns presale bucket data", async () => {
        vi.mocked(safeFetchPresaleBucketV2).mockResolvedValueOnce(mockPresaleBucketData as any);

        const result = await callHandler({
          method: "tools/call",
          params: {
            name: "get_presale",
            arguments: { genesisAccount: "GenesisAccountPubkey123", bucketIndex: 2 },
          },
        }, {});

        const data = JSON.parse(result.content[0].text);
        expect(data.address).toBe("PresaleBucketPda123");
      });
    });

    describe("get_vault", () => {
      it("returns vault bucket data", async () => {
        vi.mocked(safeFetchVaultBucketV2).mockResolvedValueOnce(mockVaultBucketData as any);

        const result = await callHandler({
          method: "tools/call",
          params: {
            name: "get_vault",
            arguments: { genesisAccount: "GenesisAccountPubkey123", bucketIndex: 3 },
          },
        }, {});

        const data = JSON.parse(result.content[0].text);
        expect(data.address).toBe("VaultBucketPda123");
      });
    });

    describe("get_launch_pool_deposit", () => {
      it("returns deposit data", async () => {
        vi.mocked(safeFetchLaunchPoolDepositV2).mockResolvedValueOnce(mockDepositData as any);

        const result = await callHandler({
          method: "tools/call",
          params: {
            name: "get_launch_pool_deposit",
            arguments: { bucketAddress: "LaunchPoolBucketPubkey123", recipient: "DepositorPubkey123" },
          },
        }, {});

        const data = JSON.parse(result.content[0].text);
        expect(data.address).toBe("LaunchPoolDepositPda123");
        expect(data.amountQuoteToken).toBe("1000000000");
      });

      it("returns not found when deposit doesn't exist", async () => {
        vi.mocked(safeFetchLaunchPoolDepositV2).mockResolvedValueOnce(null);

        const result = await callHandler({
          method: "tools/call",
          params: {
            name: "get_launch_pool_deposit",
            arguments: { bucketAddress: "LaunchPoolBucketPubkey123", recipient: "UnknownDepositor" },
          },
        }, {});

        expect(result.content[0].text).toContain("not found");
      });
    });

    describe("get_presale_deposit", () => {
      it("returns presale deposit data", async () => {
        vi.mocked(safeFetchPresaleDepositV2).mockResolvedValueOnce(mockDepositData as any);

        const result = await callHandler({
          method: "tools/call",
          params: {
            name: "get_presale_deposit",
            arguments: { bucketAddress: "PresaleBucketPubkey123", recipient: "DepositorPubkey123" },
          },
        }, {});

        const data = JSON.parse(result.content[0].text);
        expect(data.address).toBe("PresaleDepositPda123");
      });
    });

    describe("get_vault_deposit", () => {
      it("returns vault deposit data", async () => {
        vi.mocked(safeFetchVaultDepositV2).mockResolvedValueOnce(mockDepositData as any);

        const result = await callHandler({
          method: "tools/call",
          params: {
            name: "get_vault_deposit",
            arguments: { bucketAddress: "VaultBucketPubkey123", recipient: "DepositorPubkey123" },
          },
        }, {});

        const data = JSON.parse(result.content[0].text);
        expect(data.address).toBe("VaultDepositPda123");
      });
    });

    describe("get_current_price", () => {
      it("returns current bonding curve price", async () => {
        vi.mocked(fetchBondingCurveBucketV2).mockResolvedValueOnce(mockBondingCurveBucketData as any);
        vi.mocked(getCurrentPrice).mockReturnValueOnce(BigInt("30000000"));

        const result = await callHandler({
          method: "tools/call",
          params: {
            name: "get_current_price",
            arguments: { bondingCurveBucket: "BondingCurveBucketPubkey123" },
          },
        }, {});

        const data = JSON.parse(result.content[0].text);
        expect(data.price).toBe("30000000");
        expect(data.bucketAddress).toBe("BondingCurveBucketPubkey123");
      });
    });

    describe("get_swap_quote", () => {
      it("returns swap quote for buy direction", async () => {
        vi.mocked(fetchBondingCurveBucketV2).mockResolvedValueOnce(mockBondingCurveBucketData as any);
        vi.mocked(getSwapResult).mockReturnValueOnce({
          amountIn: BigInt("1000000000"),
          fee: BigInt("5000000"),
          amountOut: BigInt("33000000000"),
        });

        const result = await callHandler({
          method: "tools/call",
          params: {
            name: "get_swap_quote",
            arguments: {
              bondingCurveBucket: "BondingCurveBucketPubkey123",
              amountIn: "1000000000",
              direction: "Buy",
            },
          },
        }, {});

        const data = JSON.parse(result.content[0].text);
        expect(data.amountIn).toBe("1000000000");
        expect(data.fee).toBe("5000000");
        expect(data.amountOut).toBe("33000000000");
        expect(data.direction).toBe("Buy");
      });

      it("returns swap quote for sell direction", async () => {
        vi.mocked(fetchBondingCurveBucketV2).mockResolvedValueOnce(mockBondingCurveBucketData as any);
        vi.mocked(getSwapResult).mockReturnValueOnce({
          amountIn: BigInt("33000000000"),
          fee: BigInt("2500000"),
          amountOut: BigInt("950000000"),
        });

        const result = await callHandler({
          method: "tools/call",
          params: {
            name: "get_swap_quote",
            arguments: {
              bondingCurveBucket: "BondingCurveBucketPubkey123",
              amountIn: "33000000000",
              direction: "Sell",
            },
          },
        }, {});

        const data = JSON.parse(result.content[0].text);
        expect(data.direction).toBe("Sell");
        expect(data.amountOut).toBe("950000000");
      });
    });

    describe("list_genesis_accounts", () => {
      it("returns all genesis accounts without filters", async () => {
        const mockBuilder = {
          whereField: vi.fn().mockReturnThis(),
          get: vi.fn().mockResolvedValueOnce([mockGenesisAccountData, mockGenesisAccountData]),
        };
        vi.mocked(getGenesisAccountV2GpaBuilder).mockReturnValueOnce(mockBuilder as any);

        const result = await callHandler({
          method: "tools/call",
          params: {
            name: "list_genesis_accounts",
            arguments: {},
          },
        }, {});

        const data = JSON.parse(result.content[0].text);
        expect(data.count).toBe(2);
        expect(data.accounts).toHaveLength(2);
      });

      it("filters by authority", async () => {
        const mockBuilder = {
          whereField: vi.fn().mockReturnThis(),
          get: vi.fn().mockResolvedValueOnce([mockGenesisAccountData]),
        };
        vi.mocked(getGenesisAccountV2GpaBuilder).mockReturnValueOnce(mockBuilder as any);

        const result = await callHandler({
          method: "tools/call",
          params: {
            name: "list_genesis_accounts",
            arguments: { authority: "AuthorityPubkey123" },
          },
        }, {});

        expect(mockBuilder.whereField).toHaveBeenCalledWith("authority", "AuthorityPubkey123");
        const data = JSON.parse(result.content[0].text);
        expect(data.count).toBe(1);
      });

      it("filters by baseMint", async () => {
        const mockBuilder = {
          whereField: vi.fn().mockReturnThis(),
          get: vi.fn().mockResolvedValueOnce([mockGenesisAccountData]),
        };
        vi.mocked(getGenesisAccountV2GpaBuilder).mockReturnValueOnce(mockBuilder as any);

        const result = await callHandler({
          method: "tools/call",
          params: {
            name: "list_genesis_accounts",
            arguments: { baseMint: "BaseMintPubkey123" },
          },
        }, {});

        expect(mockBuilder.whereField).toHaveBeenCalledWith("baseMint", "BaseMintPubkey123");
      });
    });

    describe("error handling", () => {
      it("returns error for unknown tool", async () => {
        const result = await callHandler({
          method: "tools/call",
          params: {
            name: "unknown_tool",
            arguments: {},
          },
        }, {});

        expect(result.isError).toBe(true);
        expect(result.content[0].text).toContain("Unknown tool");
      });

      it("handles RPC errors gracefully", async () => {
        vi.mocked(safeFetchGenesisAccountV2).mockRejectedValueOnce(new Error("RPC connection failed"));

        const result = await callHandler({
          method: "tools/call",
          params: {
            name: "get_genesis_account",
            arguments: { address: "SomeAddress" },
          },
        }, {});

        expect(result.isError).toBe(true);
        expect(result.content[0].text).toContain("RPC connection failed");
      });

      it("handles invalid public key", async () => {
        vi.mocked(safeFetchGenesisAccountV2).mockRejectedValueOnce(new Error("Invalid public key"));

        const result = await callHandler({
          method: "tools/call",
          params: {
            name: "get_genesis_account",
            arguments: { address: "invalid-key" },
          },
        }, {});

        expect(result.isError).toBe(true);
        expect(result.content[0].text).toContain("Invalid public key");
      });
    });

    describe("input validation", () => {
      it("rejects missing required address param", async () => {
        const result = await callHandler({
          method: "tools/call",
          params: {
            name: "get_genesis_account",
            arguments: {},
          },
        }, {});

        expect(result.isError).toBe(true);
        expect(result.content[0].text).toContain("Error");
      });

      it("rejects invalid type for address param", async () => {
        const result = await callHandler({
          method: "tools/call",
          params: {
            name: "get_genesis_account",
            arguments: { address: 12345 },
          },
        }, {});

        expect(result.isError).toBe(true);
      });

      it("rejects missing required genesisAccount for bucket tools", async () => {
        const result = await callHandler({
          method: "tools/call",
          params: {
            name: "get_bonding_curve",
            arguments: { bucketIndex: 0 },
          },
        }, {});

        expect(result.isError).toBe(true);
      });

      it("rejects invalid direction for swap quote", async () => {
        const result = await callHandler({
          method: "tools/call",
          params: {
            name: "get_swap_quote",
            arguments: {
              bondingCurveBucket: "SomeBucket",
              amountIn: "1000000",
              direction: "InvalidDirection",
            },
          },
        }, {});

        expect(result.isError).toBe(true);
      });

      it("accepts valid swap directions", async () => {
        vi.mocked(fetchBondingCurveBucketV2).mockResolvedValue(mockBondingCurveBucketData as any);
        vi.mocked(getSwapResult).mockReturnValue({
          amountIn: BigInt("1000"),
          fee: BigInt("10"),
          amountOut: BigInt("990"),
        });

        const buyResult = await callHandler({
          method: "tools/call",
          params: {
            name: "get_swap_quote",
            arguments: {
              bondingCurveBucket: "SomeBucket",
              amountIn: "1000",
              direction: "Buy",
            },
          },
        }, {});
        expect(buyResult.isError).toBeUndefined();

        const sellResult = await callHandler({
          method: "tools/call",
          params: {
            name: "get_swap_quote",
            arguments: {
              bondingCurveBucket: "SomeBucket",
              amountIn: "1000",
              direction: "Sell",
            },
          },
        }, {});
        expect(sellResult.isError).toBeUndefined();
      });

      it("uses default values for optional params", async () => {
        vi.mocked(safeFetchGenesisAccountV2).mockResolvedValueOnce(mockGenesisAccountData as any);

        const result = await callHandler({
          method: "tools/call",
          params: {
            name: "get_genesis_account_by_mint",
            arguments: { baseMint: "SomeMint" },
          },
        }, {});

        expect(result.isError).toBeUndefined();
      });
    });
  });
});

describe("serializeBigInts helper", () => {
  it("converts bigints to strings in nested objects", async () => {
    const { server } = createServer();
    vi.mocked(safeFetchGenesisAccountV2).mockResolvedValueOnce({
      publicKey: "test",
      nested: {
        bigValue: BigInt("9007199254740993"),
        array: [BigInt("123"), BigInt("456")],
      },
    } as any);

    const handler = (server as any)._requestHandlers.get("tools/call");
    const result = await handler({
      method: "tools/call",
      params: {
        name: "get_genesis_account",
        arguments: { address: "test" },
      },
    }, {});

    const data = JSON.parse(result.content[0].text);
    expect(data.nested.bigValue).toBe("9007199254740993");
    expect(data.nested.array).toEqual(["123", "456"]);
  });
});
