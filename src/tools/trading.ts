import { Umi, publicKey } from "@metaplex-foundation/umi";
import {
  fetchBondingCurveBucketV2,
  getSwapResult,
  getCurrentPrice,
  SwapDirection,
} from "@metaplex-foundation/genesis";
import { GetCurrentPriceSchema, GetSwapQuoteSchema } from "../types/schemas.js";
import { ToolResult } from "../types/tools.js";

export async function getCurrentPriceTool(
  umi: Umi,
  args: unknown,
): Promise<ToolResult> {
  const { bondingCurveBucket } = GetCurrentPriceSchema.parse(args);
  const bucket = await fetchBondingCurveBucketV2(
    umi,
    publicKey(bondingCurveBucket),
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const price = getCurrentPrice(bucket as any);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          { price: price.toString(), bucketAddress: bondingCurveBucket },
          null,
          2,
        ),
      },
    ],
  };
}

export async function getSwapQuote(
  umi: Umi,
  args: unknown,
): Promise<ToolResult> {
  const { bondingCurveBucket, amountIn, direction } =
    GetSwapQuoteSchema.parse(args);
  const bucket = await fetchBondingCurveBucketV2(
    umi,
    publicKey(bondingCurveBucket),
  );
  const swapDirection =
    direction === "Buy" ? SwapDirection.Buy : SwapDirection.Sell;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = getSwapResult(bucket as any, BigInt(amountIn), swapDirection);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            amountIn: result.amountIn.toString(),
            fee: result.fee.toString(),
            amountOut: result.amountOut.toString(),
            direction,
            bucketAddress: bondingCurveBucket,
          },
          null,
          2,
        ),
      },
    ],
  };
}
