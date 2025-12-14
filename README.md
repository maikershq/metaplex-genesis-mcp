# Metaplex Genesis MCP Server

An MCP (Model Context Protocol) server for interacting with the [Metaplex Genesis](https://github.com/metaplex-foundation/genesis) program on Solana.

## Installation

```bash
pnpm install
pnpm build
```

## Testing

```bash
pnpm test              # Run unit tests (31 tests, mocked)
pnpm test:watch        # Run unit tests in watch mode
pnpm test:integration  # Run integration tests (8 tests, real MCP client)
pnpm test:smoke        # Run shell smoke test
```

### Test Coverage

| Type | Tests | Description |
|------|-------|-------------|
| Unit | 31 | Mocked dependencies, fast |
| Integration | 8 | Real MCP client via stdio, hits mainnet RPC |
| Smoke | 1 | Shell script, verifies server starts |

## Usage

### With Cursor/Claude

Add to your MCP config:

```json
{
  "mcpServers": {
    "metaplex-genesis": {
      "command": "node",
      "args": ["/path/to/metaplex-genesis-mcp/dist/index.js"],
      "env": {
        "SOLANA_RPC_URL": "https://api.mainnet-beta.solana.com"
      }
    }
  }
}
```

### Environment Variables

- `SOLANA_RPC_URL` - Solana RPC endpoint (default: `https://api.mainnet-beta.solana.com`)

## Available Tools

### Account Fetching

- `get_genesis_account` - Fetch a Genesis account by address
- `get_genesis_account_by_mint` - Fetch a Genesis account by base token mint
- `list_genesis_accounts` - List Genesis accounts with optional filters

### Bucket Data

- `get_bonding_curve` - Fetch bonding curve bucket data
- `get_launch_pool` - Fetch launch pool bucket data
- `get_presale` - Fetch presale bucket data
- `get_vault` - Fetch vault bucket data

### User Deposits

- `get_launch_pool_deposit` - Fetch a recipient's launch pool deposit
- `get_presale_deposit` - Fetch a recipient's presale deposit
- `get_vault_deposit` - Fetch a recipient's vault deposit

### Trading Helpers

- `get_current_price` - Get current bonding curve price
- `get_swap_quote` - Calculate swap amounts with fees

## Examples

### Get a Genesis Account by Mint

```
Use get_genesis_account_by_mint with baseMint "TokenMintAddress..."
```

### Get Swap Quote

```
Use get_swap_quote with:
- bondingCurveBucket: "BucketAddress..."
- amountIn: "1000000000" (1 SOL in lamports)
- direction: "Buy"
```

## License

MIT
