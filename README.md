# Metaplex Genesis MCP

**Model Context Protocol server for Metaplex Genesis.**

> Fetch accounts. Query bonding curves. Get swap quotes. Create Genesis transactions.

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
- 🔧 **Transaction Creation** - Build Genesis initialization and swap transactions

## Quick Start

### Usage with npx (Recommended)

Run the server directly without installation:

```bash
npx metaplex-genesis-mcp
```

### Installation

Install globally to use as a command:

```bash
npm install -g metaplex-genesis-mcp
metaplex-genesis-mcp
```

### From Source

```bash
pnpm install
pnpm build
```

### Docker

```bash
docker compose up -d
```

Or build manually:

```bash
docker build -t metaplex-genesis-mcp .
docker run -e SOLANA_RPC_URL=https://api.mainnet-beta.solana.com metaplex-genesis-mcp
```

## Configuration

Add to your MCP config (Cursor `.cursor/mcp.json` or Claude Desktop):

```json
{
  "mcpServers": {
    "metaplex-genesis": {
      "command": "npx",
      "args": ["-y", "metaplex-genesis-mcp"],
      "env": {
        "SOLANA_RPC_URL": "https://api.mainnet-beta.solana.com"
      }
    }
  }
}
```

### Local Development Configuration

If running from source:

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

| Tool                          | Description                                 |
| ----------------------------- | ------------------------------------------- |
| `get_genesis_account`         | Fetch a Genesis account by address          |
| `get_genesis_account_by_mint` | Fetch a Genesis account by base token mint  |
| `list_genesis_accounts`       | List Genesis accounts with optional filters |

### Bucket Data

| Tool                | Description                     |
| ------------------- | ------------------------------- |
| `get_bonding_curve` | Fetch bonding curve bucket data |
| `get_launch_pool`   | Fetch launch pool bucket data   |
| `get_presale`       | Fetch presale bucket data       |
| `get_vault`         | Fetch vault bucket data         |

### User Deposits

| Tool                      | Description                             |
| ------------------------- | --------------------------------------- |
| `get_launch_pool_deposit` | Fetch a recipient's launch pool deposit |
| `get_presale_deposit`     | Fetch a recipient's presale deposit     |
| `get_vault_deposit`       | Fetch a recipient's vault deposit       |

### Trading Helpers

| Tool                | Description                      |
| ------------------- | -------------------------------- |
| `get_current_price` | Get current bonding curve price  |
| `get_swap_quote`    | Calculate swap amounts with fees |

### Transaction Creation

| Tool                     | Description                                         |
| ------------------------ | --------------------------------------------------- |
| `create_genesis_account` | Build a Genesis initialization transaction (base64) |
| `swap`                   | Build a swap transaction (base64)                   |

## Project Structure

```
src/
├── tools/           # Tool handlers (accounts, buckets, deposits, trading, transactions)
├── types/           # TypeScript types and Zod schemas
├── services/        # Metaplex SDK service layer
├── utils/           # Serialization and formatting helpers
├── server.ts        # MCP server setup
├── stdio.ts         # Stdio transport entry point
└── index.ts         # CLI entry point
```

## Testing

```bash
pnpm test              # Unit tests (mocked)
pnpm test:watch        # Unit tests in watch mode
pnpm test:integration  # Integration tests (real MCP client)
pnpm test:smoke        # Shell smoke test
```

## Development

```bash
pnpm install       # Install dependencies
pnpm build         # Build for production
pnpm test          # Run tests
```

## Related Repositories

- **[metaplex-genesis](https://github.com/metaplex-foundation/genesis)** - Metaplex Genesis program
- **[mcp-typescript-sdk](https://github.com/modelcontextprotocol/typescript-sdk)** - MCP TypeScript SDK
- **[umi](https://github.com/metaplex-foundation/umi)** - Metaplex Umi framework

## License

Apache License 2.0 - see [LICENSE](LICENSE) for details.

---

**Built by [maikers - creators of realities](https://maikers.com)**
