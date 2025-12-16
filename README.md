# Metaplex Genesis MCP

**Model Context Protocol server for Metaplex Genesis.**

> Fetch accounts. Query bonding curves. Get swap quotes.

MCP tools for interacting with Metaplex Genesis on Solana.

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6)](https://typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-Compatible-purple)](https://modelcontextprotocol.io/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue)](LICENSE)

## Overview

An MCP server that exposes tools for interacting with the [Metaplex Genesis](https://github.com/metaplex-foundation/genesis) program. Use with Cursor, Claude Desktop, or any MCP-compatible client.

**Core Capabilities:**

- 📊 **Account Fetching** - Get Genesis accounts by address or mint
- 💰 **Bucket Data** - Query bonding curves, launch pools, presales, vaults
- 👤 **User Deposits** - Fetch deposit info for any recipient
- 📈 **Trading Helpers** - Current prices and swap quotes with fees

## Quick Start

```bash
pnpm install
pnpm build
```

## Configuration

Add to your MCP config (Cursor `.cursor/mcp.json` or Claude Desktop):

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

| Variable         | Required | Default                               | Description         |
| ---------------- | -------- | ------------------------------------- | ------------------- |
| `SOLANA_RPC_URL` | No       | `https://api.mainnet-beta.solana.com` | Solana RPC endpoint |

## Available Tools

### Account Fetching

| Tool                          | Description                                |
| ----------------------------- | ------------------------------------------ |
| `get_genesis_account`         | Fetch a Genesis account by address         |
| `get_genesis_account_by_mint` | Fetch a Genesis account by base token mint |
| `list_genesis_accounts`       | List Genesis accounts with optional filters |

### Bucket Data

| Tool               | Description                     |
| ------------------ | ------------------------------- |
| `get_bonding_curve` | Fetch bonding curve bucket data |
| `get_launch_pool`  | Fetch launch pool bucket data   |
| `get_presale`      | Fetch presale bucket data       |
| `get_vault`        | Fetch vault bucket data         |

### User Deposits

| Tool                      | Description                              |
| ------------------------- | ---------------------------------------- |
| `get_launch_pool_deposit` | Fetch a recipient's launch pool deposit  |
| `get_presale_deposit`     | Fetch a recipient's presale deposit      |
| `get_vault_deposit`       | Fetch a recipient's vault deposit        |

### Trading Helpers

| Tool               | Description                      |
| ------------------ | -------------------------------- |
| `get_current_price` | Get current bonding curve price  |
| `get_swap_quote`   | Calculate swap amounts with fees |

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

## Testing

```bash
pnpm test              # Unit tests (31 tests, mocked)
pnpm test:watch        # Unit tests in watch mode
pnpm test:integration  # Integration tests (8 tests, real MCP client)
pnpm test:smoke        # Shell smoke test
```

| Type        | Tests | Description                             |
| ----------- | ----- | --------------------------------------- |
| Unit        | 31    | Mocked dependencies, fast               |
| Integration | 8     | Real MCP client via stdio, hits mainnet |
| Smoke       | 1     | Shell script, verifies server starts    |

## Development

```bash
pnpm install       # Install dependencies
pnpm build         # Build for production
pnpm test          # Run tests
pnpm lint          # ESLint
pnpm format        # Prettier
```

## Related Repositories

- **[metaplex-genesis](https://github.com/metaplex-foundation/genesis)** - Metaplex Genesis program
- **[mcp-typescript-sdk](https://github.com/modelcontextprotocol/typescript-sdk)** - MCP TypeScript SDK
- **[umi](https://github.com/metaplex-foundation/umi)** - Metaplex Umi framework

## License

Apache License 2.0 - see [LICENSE](LICENSE) for details.

---

**Built by [maikers - creators of realities](https://maikers.com)**
