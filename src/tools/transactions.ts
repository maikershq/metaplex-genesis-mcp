import { Umi, publicKey, createNoopSigner } from "@metaplex-foundation/umi";
import { initializeV2 } from "@metaplex-foundation/genesis";
import { CreateGenesisAccountSchema } from "../types/schemas.js";
import { ToolResult } from "../types/tools.js";

export async function createGenesisAccount(
  umi: Umi,
  args: unknown,
): Promise<ToolResult> {
  const {
    baseMint,
    totalSupplyBaseToken,
    name: tokenName,
    uri,
    symbol,
    fundingMode,
    authority,
    payer,
  } = CreateGenesisAccountSchema.parse(args);

  const authorityKey = authority
    ? publicKey(authority)
    : payer
      ? publicKey(payer)
      : null;
  const payerKey = payer
    ? publicKey(payer)
    : authority
      ? publicKey(authority)
      : null;

  if (!authorityKey || !payerKey) {
    throw new Error("At least one of authority or payer must be provided.");
  }

  const fundingModeVal = fundingMode === "Mint" ? 0 : 1;
  const latestBlockhash = await umi.rpc.getLatestBlockhash();

  const authoritySigner = createNoopSigner(authorityKey);
  const payerSigner = createNoopSigner(payerKey);
  const baseMintSigner = createNoopSigner(publicKey(baseMint));

  const txBuilder = initializeV2(umi, {
    baseMint: baseMintSigner,
    authority: authoritySigner,
    payer: payerSigner,
    fundingMode: fundingModeVal,
    totalSupplyBaseToken: BigInt(totalSupplyBaseToken),
    name: tokenName,
    uri,
    symbol,
  }).setBlockhash(latestBlockhash);

  const tx = await txBuilder.build(umi);
  const serialized = umi.transactions.serialize(tx);
  const base64Tx = Buffer.from(serialized).toString("base64");

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            transaction: base64Tx,
            message:
              "Sign and submit this transaction to initialize the Genesis account.",
          },
          null,
          2,
        ),
      },
    ],
  };
}
