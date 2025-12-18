import { Umi } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { genesis } from "@metaplex-foundation/genesis";
import { mplToolbox } from "@metaplex-foundation/mpl-toolbox";

const DEFAULT_RPC_URL = "https://api.mainnet-beta.solana.com";

let umiInstance: Umi | null = null;

export function getUmi(rpcUrl: string = DEFAULT_RPC_URL): Umi {
  if (!umiInstance) {
    umiInstance = createUmi(rpcUrl).use(genesis()).use(mplToolbox());
  }
  return umiInstance;
}

export function createUmiInstance(rpcUrl: string): Umi {
  return createUmi(rpcUrl).use(genesis()).use(mplToolbox());
}
