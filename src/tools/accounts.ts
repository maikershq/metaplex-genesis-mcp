import { Umi, publicKey } from "@metaplex-foundation/umi";
import {
  safeFetchGenesisAccountV2,
  findGenesisAccountV2Pda,
  getGenesisAccountV2GpaBuilder,
} from "@metaplex-foundation/genesis";
import {
  GetGenesisAccountSchema,
  GetGenesisAccountByMintSchema,
  ListGenesisAccountsSchema,
} from "../types/schemas.js";
import { ToolResult } from "../types/tools.js";
import {
  serializeBigInts,
  formatResponse,
  jsonResponse,
} from "../utils/serialization.js";

export async function getGenesisAccount(
  umi: Umi,
  args: unknown,
): Promise<ToolResult> {
  const { address } = GetGenesisAccountSchema.parse(args);
  const account = await safeFetchGenesisAccountV2(umi, publicKey(address));
  if (!account) {
    return {
      content: [
        { type: "text", text: `Genesis account not found: ${address}` },
      ],
    };
  }
  return {
    content: [{ type: "text", text: jsonResponse(account) }],
  };
}

export async function getGenesisAccountByMint(
  umi: Umi,
  args: unknown,
): Promise<ToolResult> {
  const { baseMint, genesisIndex } = GetGenesisAccountByMintSchema.parse(args);
  const pda = findGenesisAccountV2Pda(umi, {
    baseMint: publicKey(baseMint),
    genesisIndex,
  });
  const account = await safeFetchGenesisAccountV2(umi, pda);
  if (!account) {
    return {
      content: [
        {
          type: "text",
          text: `Genesis account not found for mint ${baseMint} at index ${genesisIndex}`,
        },
      ],
    };
  }
  return {
    content: [{ type: "text", text: formatResponse(pda[0], account) }],
  };
}

export async function listGenesisAccounts(
  umi: Umi,
  args: unknown,
): Promise<ToolResult> {
  const { authority, baseMint } = ListGenesisAccountsSchema.parse(args);
  let builder = getGenesisAccountV2GpaBuilder(umi);

  if (authority) {
    builder = builder.whereField("authority", publicKey(authority));
  }
  if (baseMint) {
    builder = builder.whereField("baseMint", publicKey(baseMint));
  }

  const accounts = await builder.get();
  const formattedAccounts = accounts.map((acc) => {
    const serialized = serializeBigInts(acc) as Record<string, unknown>;
    return { address: acc.publicKey, ...serialized };
  });

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          { count: accounts.length, accounts: formattedAccounts },
          null,
          2,
        ),
      },
    ],
  };
}
