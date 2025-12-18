import { Umi, publicKey } from "@metaplex-foundation/umi";
import {
  safeFetchBondingCurveBucketV2,
  safeFetchLaunchPoolBucketV2,
  safeFetchPresaleBucketV2,
  safeFetchVaultBucketV2,
  findBondingCurveBucketV2Pda,
  findLaunchPoolBucketV2Pda,
  findPresaleBucketV2Pda,
  findVaultBucketV2Pda,
} from "@metaplex-foundation/genesis";
import { GetBucketSchema } from "../types/schemas.js";
import { ToolResult } from "../types/tools.js";
import { formatResponse } from "../utils/serialization.js";

export async function getBondingCurve(
  umi: Umi,
  args: unknown,
): Promise<ToolResult> {
  const { genesisAccount, bucketIndex } = GetBucketSchema.parse(args);
  const pda = findBondingCurveBucketV2Pda(umi, {
    genesisAccount: publicKey(genesisAccount),
    bucketIndex,
  });
  const bucket = await safeFetchBondingCurveBucketV2(umi, pda);
  if (!bucket) {
    return {
      content: [
        {
          type: "text",
          text: `Bonding curve bucket not found for genesis ${genesisAccount} at index ${bucketIndex}`,
        },
      ],
    };
  }
  return {
    content: [{ type: "text", text: formatResponse(pda[0], bucket) }],
  };
}

export async function getLaunchPool(
  umi: Umi,
  args: unknown,
): Promise<ToolResult> {
  const { genesisAccount, bucketIndex } = GetBucketSchema.parse(args);
  const pda = findLaunchPoolBucketV2Pda(umi, {
    genesisAccount: publicKey(genesisAccount),
    bucketIndex,
  });
  const bucket = await safeFetchLaunchPoolBucketV2(umi, pda);
  if (!bucket) {
    return {
      content: [
        {
          type: "text",
          text: `Launch pool bucket not found for genesis ${genesisAccount} at index ${bucketIndex}`,
        },
      ],
    };
  }
  return {
    content: [{ type: "text", text: formatResponse(pda[0], bucket) }],
  };
}

export async function getPresale(umi: Umi, args: unknown): Promise<ToolResult> {
  const { genesisAccount, bucketIndex } = GetBucketSchema.parse(args);
  const pda = findPresaleBucketV2Pda(umi, {
    genesisAccount: publicKey(genesisAccount),
    bucketIndex,
  });
  const bucket = await safeFetchPresaleBucketV2(umi, pda);
  if (!bucket) {
    return {
      content: [
        {
          type: "text",
          text: `Presale bucket not found for genesis ${genesisAccount} at index ${bucketIndex}`,
        },
      ],
    };
  }
  return {
    content: [{ type: "text", text: formatResponse(pda[0], bucket) }],
  };
}

export async function getVault(umi: Umi, args: unknown): Promise<ToolResult> {
  const { genesisAccount, bucketIndex } = GetBucketSchema.parse(args);
  const pda = findVaultBucketV2Pda(umi, {
    genesisAccount: publicKey(genesisAccount),
    bucketIndex,
  });
  const bucket = await safeFetchVaultBucketV2(umi, pda);
  if (!bucket) {
    return {
      content: [
        {
          type: "text",
          text: `Vault bucket not found for genesis ${genesisAccount} at index ${bucketIndex}`,
        },
      ],
    };
  }
  return {
    content: [{ type: "text", text: formatResponse(pda[0], bucket) }],
  };
}
