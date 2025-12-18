import { Umi, publicKey } from "@metaplex-foundation/umi";
import {
  safeFetchLaunchPoolDepositV2,
  safeFetchPresaleDepositV2,
  safeFetchVaultDepositV2,
  findLaunchPoolDepositV2Pda,
  findPresaleDepositV2Pda,
  findVaultDepositV2Pda,
} from "@metaplex-foundation/genesis";
import { GetDepositSchema } from "../types/schemas.js";
import { ToolResult } from "../types/tools.js";
import { formatResponse } from "../utils/serialization.js";

export async function getLaunchPoolDeposit(
  umi: Umi,
  args: unknown,
): Promise<ToolResult> {
  const { bucketAddress, recipient } = GetDepositSchema.parse(args);
  const pda = findLaunchPoolDepositV2Pda(umi, {
    bucket: publicKey(bucketAddress),
    recipient: publicKey(recipient),
  });
  const deposit = await safeFetchLaunchPoolDepositV2(umi, pda);
  if (!deposit) {
    return {
      content: [
        {
          type: "text",
          text: `Launch pool deposit not found for recipient ${recipient}`,
        },
      ],
    };
  }
  return {
    content: [{ type: "text", text: formatResponse(pda[0], deposit) }],
  };
}

export async function getPresaleDeposit(
  umi: Umi,
  args: unknown,
): Promise<ToolResult> {
  const { bucketAddress, recipient } = GetDepositSchema.parse(args);
  const pda = findPresaleDepositV2Pda(umi, {
    bucket: publicKey(bucketAddress),
    recipient: publicKey(recipient),
  });
  const deposit = await safeFetchPresaleDepositV2(umi, pda);
  if (!deposit) {
    return {
      content: [
        {
          type: "text",
          text: `Presale deposit not found for recipient ${recipient}`,
        },
      ],
    };
  }
  return {
    content: [{ type: "text", text: formatResponse(pda[0], deposit) }],
  };
}

export async function getVaultDeposit(
  umi: Umi,
  args: unknown,
): Promise<ToolResult> {
  const { bucketAddress, recipient } = GetDepositSchema.parse(args);
  const pda = findVaultDepositV2Pda(umi, {
    bucket: publicKey(bucketAddress),
    recipient: publicKey(recipient),
  });
  const deposit = await safeFetchVaultDepositV2(umi, pda);
  if (!deposit) {
    return {
      content: [
        {
          type: "text",
          text: `Vault deposit not found for recipient ${recipient}`,
        },
      ],
    };
  }
  return {
    content: [{ type: "text", text: formatResponse(pda[0], deposit) }],
  };
}
