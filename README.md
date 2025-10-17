# M²F - Micro Merchant Finance

<div align="center">

  <img src="https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity&logoColor=white" alt="Solidity"/>
  <img src="https://img.shields.io/badge/Celo-FFDE21?style=for-the-badge&logo=ethereum&logoColor=white" alt="Celo"/>
  <img src="https://img.shields.io/badge/Algebra-00CED1?style=for-the-badge&logo=uniswap&logoColor=white" alt="Algebra"/>
  <img src="https://img.shields.io/badge/Self-06402B?style=for-the-badge&logo=uniswap&logoColor=white" alt="Self"/>

</div>

<p align="center">
  <img src="assets/logo.png" alt="M²F Logo" width="300"/>
</p>

## Table of Contents
- [Demo](#demo)
- [Problem Description](#problem-description)
- [Solution Overview](#solution-overview)
- [Architecture](#architecture)
- [Key Metrics](#key-metrics)
- [Deployed Contracts](#deployed-contracts)
- [Setup](#setup)
- [References](#references)

## Demo

🚀 **Live Demo**: [M²F Demo Platform](https://demo.m2f.finance)

**Key Features Demonstrated:**
- Merchant onboarding with Self Protocol verification
- Credit Default Swap (CDS) creation and management
- Mento stablecoin integration for risk mitigation
- Mobile-first interface for global accessibility

## Problem Description

High cost on raising capital specilly for small merchants bootstrapping

Not clear workflow on the lifetime of business equitiy tokens

Not proper access to lending market on optimal conditions (where the prject has decent credit scoring conditions for fair lending opportunities)

Investors are on teh wild west not  knowiung theorigin or legintimacy of business they are putting  capital on (Missing verificaito, KYC on merchants, (people raigin funds))


## Solution Overview

- Privacy preserving  merchant verification for full transparency and bookkepping on credit scoring and financial health not compromising privacy


- Fair market conditions for business equitiy tokens aon all prject lifetime span


### Core Solution Architecture


## Architecture


## Key Metrics

## Deployed Contracts

### Addresses

#### Celo Sepolia

#### Celo Alfajores

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- [Git](https://git-scm.com/)
- [Alchemy API Key](https://www.alchemy.com/) (for RPC endpoints)

### Quick Start

```bash
```


# Run tests
```
forge test
```

### Environment Configuration

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Update `.env` with your configuration:
```env
# Alchemy API Keys
ALCHEMY_API_KEY=your_alchemy_api_key_here

# Explorer API Keys
CELO_SEPOLIA_EXPLORER_API_KEY=your_celo_sepolia_key
CELO_ALFAJORES_EXPLORER_API_KEY=your_celo_alfajores_key

# Private Keys (for deployment)
PRIVATE_KEY=your_private_key_here

# Network Configuration
CELO_RPC_URL=https://celo-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}
CELO_SEPOLIA_RPC_URL=https://celo-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}
CELO_ALFAJORES_RPC_URL=https://celo-alfajores.g.alchemy.com/v2/${ALCHEMY_API_KEY}
```

### Build

```bash
# Compile all contracts
forge build

# Build with optimizations
forge build --optimize --optimizer-runs 200
```

### Test

```bash
# Run all tests
forge test



# Run tests with gas reporting
forge test --gas-report

# Run tests with coverage
forge coverage
```



## References

- [Celo Documentation](https://docs.celo.org/)
- [Self Protocol](https://self.xyz/)
- [Foundry Book](https://book.getfoundry.sh/)
- [Uniswap V4 Hooks](https://docs.uniswap.org/sdk/v4/overview)








