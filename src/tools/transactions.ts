import {
  Umi,
  publicKey,
  createNoopSigner,
  generateSigner,
} from "@metaplex-foundation/umi";
import {
  initializeV2,
  swapV2,
  SwapDirection,
} from "@metaplex-foundation/genesis";
import { CreateGenesisAccountSchema, SwapSchema } from "../types/schemas.js";
import { ToolResult } from "../types/tools.js";

export async function swap(umi: Umi, args: unknown): Promise<ToolResult> {
  const { bondingCurveBucket, amountIn, minAmountOut, direction, authority } =
    SwapSchema.parse(args);

  const authorityKey = publicKey(authority);
  const latestBlockhash = await umi.rpc.getLatestBlockhash();
  const authoritySigner = createNoopSigner(authorityKey);

  const swapDirection =
    direction === "Buy" ? SwapDirection.Buy : SwapDirection.Sell;

  const txBuilder = swapV2(umi, {
    bondingCurveBucket: publicKey(bondingCurveBucket),
    authority: authoritySigner,
    amountIn: BigInt(amountIn),
    minAmountOut: BigInt(minAmountOut),
    direction: swapDirection,
  })
    .setBlockhash(latestBlockhash)
    .setFeePayer(authoritySigner);

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
            message: "Sign and submit this transaction to execute the swap.",
          },
          null,
          2,
        ),
      },
    ],
  };
}

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

  // Generate a new keypair for the baseMint if "generate" is passed
  // Otherwise use provided address as NoopSigner
  let baseMintSigner;
  let generatedMintSecretKey: string | undefined;

  if (baseMint === "generate") {
    const generatedMint = generateSigner(umi);
    baseMintSigner = generatedMint;
    generatedMintSecretKey = Buffer.from(generatedMint.secretKey).toString(
      "base64",
    );
  } else {
    baseMintSigner = createNoopSigner(publicKey(baseMint));
  }

  const txBuilder = initializeV2(umi, {
    baseMint: baseMintSigner,
    authority: authoritySigner,
    payer: payerSigner,
    fundingMode: fundingModeVal,
    totalSupplyBaseToken: BigInt(totalSupplyBaseToken),
    name: tokenName,
    uri,
    symbol,
  })
    .setBlockhash(latestBlockhash)
    .setFeePayer(payerSigner);

  const tx = await txBuilder.build(umi);
  const serialized = umi.transactions.serialize(tx);
  const base64Tx = Buffer.from(serialized).toString("base64");

  const response: Record<string, unknown> = {
    transaction: base64Tx,
    message:
      "Sign and submit this transaction to initialize the Genesis account.",
    baseMint: baseMintSigner.publicKey.toString(),
  };

  if (generatedMintSecretKey) {
    response.mintSecretKey = generatedMintSecretKey;
    response.message =
      "Sign and submit this transaction. The mint keypair has been generated and must be used to sign.";
  }

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(response, null, 2),
      },
    ],
  };
}
