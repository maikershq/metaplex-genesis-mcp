import { Umi } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { genesis } from "@metaplex-foundation/genesis";

const DEFAULT_RPC_URL = "https://api.mainnet-beta.solana.com";

let umiInstance: Umi | null = null;

export function getUmi(rpcUrl: string = DEFAULT_RPC_URL): Umi {
  if (!umiInstance) {
    umiInstance = createUmi(rpcUrl).use(genesis());
  }
  return umiInstance;
}

export function createUmiInstance(rpcUrl: string): Umi {
  return createUmi(rpcUrl).use(genesis());
}
