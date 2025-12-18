export enum ToolName {
  GET_GENESIS_ACCOUNT = "get_genesis_account",
  GET_GENESIS_ACCOUNT_BY_MINT = "get_genesis_account_by_mint",
  GET_BONDING_CURVE = "get_bonding_curve",
  GET_LAUNCH_POOL = "get_launch_pool",
  GET_PRESALE = "get_presale",
  GET_VAULT = "get_vault",
  GET_LAUNCH_POOL_DEPOSIT = "get_launch_pool_deposit",
  GET_PRESALE_DEPOSIT = "get_presale_deposit",
  GET_VAULT_DEPOSIT = "get_vault_deposit",
  GET_CURRENT_PRICE = "get_current_price",
  GET_SWAP_QUOTE = "get_swap_quote",
  SWAP = "swap",
  LIST_GENESIS_ACCOUNTS = "list_genesis_accounts",
  CREATE_GENESIS_ACCOUNT = "create_genesis_account",
}

export interface ToolResult {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
  [key: string]: unknown;
}
