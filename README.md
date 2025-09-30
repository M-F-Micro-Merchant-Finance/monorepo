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

**Financial Exclusion Crisis**: 1.7B adults globally lack access to formal financial services, particularly merchants in emerging markets who face:

- **High Transaction Costs**: Traditional DeFi platforms charge 0.3-1% fees, making micro-transactions unviable
- **Credit Access Barriers**: No credit history or collateral requirements exclude small merchants
- **Privacy Concerns**: Financial data exposure limits merchant participation
- **Stability Risks**: Volatile crypto prices create operational challenges for merchants

**Market Gap**: Existing AMMs focus on large-scale trading, ignoring micro-finance needs of underserved merchant communities.

## Solution Overview

**M²F (Micro Merchant Finance)** is a specialized AMM protocol built on Celo that enables micro-finance solutions for merchants through:

- **Credit Default Swaps (CDS)**: ERC6909-based tokens representing merchant credit risk
- **Mento Integration**: Leverages Celo's stablecoin ecosystem for price stability
- **Self Protocol**: Privacy-preserving identity verification for merchant onboarding
- **Algebra Protocol**: High-efficiency AMM with custom hooks for merchant-specific features

### Core Solution Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Merchants     │◄──►│   M²F Protocol   │◄──►│   Mento/Celo    │
│  (Mobile-First) │    │  (CDS + AMM)     │    │  (Stability)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Self Protocol  │    │  Algebra Hooks   │    │  Credit Risk    │
│  (Privacy)      │    │  (Custom Logic)  │    │  Assessment     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Architecture

**Smart Contract Layer:**
- `CDSFactory.sol`: Deploys Credit Default Swap contracts for merchants
- `MerchantDataMediator.sol`: Manages merchant data and credit assessments
- `CollateralFilter.sol`: Validates acceptable collateral types
- `MerchantIdentityVerification.sol`: Integrates with Self Protocol

**Integration Layer:**
- **Algebra Protocol**: Custom hooks for merchant-specific AMM logic
- **Mento Protocol**: Stablecoin selection and price stability
- **Self Protocol**: Privacy-preserving identity verification

**Frontend Layer:**
- Mobile-first React application
- QR code integration for merchant onboarding
- Real-time credit risk monitoring dashboard

## Key Metrics

**Target Performance:**
- **Transaction Fees**: <0.1% (vs 0.3-1% traditional DeFi)
- **Gas Costs**: <$0.01 per transaction (Celo advantage)
- **Merchant Onboarding**: <5 minutes with Self Protocol
- **Credit Assessment**: Real-time risk scoring
- **Mobile Compatibility**: 100% mobile-first design

**Success Indicators:**
- 10,000+ active merchants by Q2 2024
- $1M+ daily transaction volume
- 95%+ uptime across all networks
- <2% default rate on CDS contracts

## Deployed Contracts

### Addresses

#### Celo Sepolia
| Contract | Address | Explorer |
|----------|---------|----------|
| **AlgebraFactory** | `0x1118879CCCe8A1237C91a5256ad1796Ad9085B91` | [Celo Sepolia](https://celo-sepolia.blockscout.com/address/0x1118879CCCe8A1237C91a5256ad1796Ad9085B91?tab=contract) |
| **AlgebraPoolDeployer** | `0xb33166BBC9f89D0C7525fF4d19526b616a26224D` | [Celo Sepolia](https://celo-sepolia.blockscout.com/address/0xb33166BBC9f89D0C7525fF4d19526b616a26224D?tab=contract) |
| **Reserve** | `0xA53fc18149A9468019D32BbDaff201FeD8E7a805` | [Celo Sepolia](https://celo-sepolia.blockscout.com/address/0xA53fc18149A9468019D32BbDaff201FeD8E7a805?tab=contract) |
| **USDC** | `0x01C5C0122039549AD1493B8220cABEdD739BC44E` | [Celo Sepolia](https://celo-sepolia.blockscout.com/address/0x01C5C0122039549AD1493B8220cABEdD739BC44E?tab=contract) |
| **cUSD** | `0xFF92b6212538479d8561B38693C9eee5EF6d1F68` | [Celo Sepolia](https://celo-sepolia.blockscout.com/address/0xFF92b6212538479d8561B38693C9eee5EF6d1F68?tab=contract) |
| **Mento Selector** | `0x124eff2236c00357B7C84442af0BCd7dC10f74F8` | [Celo Sepolia](https://celo-sepolia.blockscout.com/address/0x124eff2236c00357B7C84442af0BCd7dC10f74F8?tab=contract) |
| **CDS Factory** | `0xd8c4Aa030C1581a7a5CCD100C123668899f4A69d` | [Celo Sepolia](https://celo-sepolia.blockscout.com/address/0xd8c4Aa030C1581a7a5CCD100C123668899f4A69d?tab=contract) |
| **Collateral Filter** | `0xeb68CF4BF61f968605418Cd83d011091b2C1cc1C` | [Celo Sepolia](https://celo-sepolia.blockscout.com/address/0xeb68CF4BF61f968605418Cd83d011091b2C1cc1C?tab=contract) |
| **Merchant Data Mediator** | `0x71542aEe829993145Cdd8B98829081d2fc358355` | [Celo Sepolia](https://celo-sepolia.blockscout.com/address/0x71542aEe829993145Cdd8B98829081d2fc358355?tab=contract) |
| **Merchant Identity Verification** | `0x8A213033892304A7a5328Fb3f6bdAfc8f93cCb49` | [Celo Sepolia](https://celo-sepolia.blockscout.com/address/0x8A213033892304A7a5328Fb3f6bdAfc8f93cCb49?tab=contract) |

#### Celo Alfajores
| Contract | Address | Explorer |
|----------|---------|----------|
| **AlgebraFactory** | `0x4F25983b470f0061CE8654607A9fF624344A6FBa` | [Celo Alfajores](https://alfajores.celoscan.io/address/0x4F25983b470f0061CE8654607A9fF624344A6FBa) |
| **AlgebraPoolDeployer** | `0xd4AC5e01b34526363828d35c4783Ebd4296c93A6` | [Celo Alfajores](https://alfajores.celoscan.io/address/0xd4AC5e01b34526363828d35c4783Ebd4296c93A6) |
| **Always_cCOP_MentoSelector_Alfajores** | `0x8d460Ef1587dBE692ACE520e9bBBef25A9ceCa11` | [Celo Alfajores](https://alfajores.celoscan.io/address/0x8d460Ef1587dBE692ACE520e9bBBef25A9ceCa11) |
| **CDSFactory** | `0x03b2844f3DE75dD4582dAcE1fC789539996e8DF2` | [Celo Alfajores](https://alfajores.celoscan.io/address/0x03b2844f3DE75dD4582dAcE1fC789539996e8DF2) |
| **CollateralFilter** | `0x730033939014C4F62E4b7108B7952917B9F516d4` | [Celo Alfajores](https://alfajores.celoscan.io/address/0x730033939014C4F62E4b7108B7952917B9F516d4) |
| **CurrencyCollateralValidator** | `0x2f1AE40ca3a236c50B39Db42BCCbBb525063253e` | [Celo Alfajores](https://alfajores.celoscan.io/address/0x2f1AE40ca3a236c50B39Db42BCCbBb525063253e) |
| **MerchantDataMediator** | `0xA98b147CaB207769655B751278DF739730eE25bD` | [Celo Alfajores](https://alfajores.celoscan.io/address/0xa98b147cab207769655b751278df739730ee25bd) |

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- [Git](https://git-scm.com/)
- [Alchemy API Key](https://www.alchemy.com/) (for RPC endpoints)

### Quick Start

```bash
# Clone and setup in one command
git clone https://github.com/M-F-Micro-Merchant-Finance/monorepo.git
cd monorepo
make setup
```

### Installation

#### Option 1: Automated Setup (Recommended)
```bash
# Complete setup with one command
make setup
```

This will:
- Install all dependencies
- Set up environment variables
- Compile contracts
- Run initial tests

#### Option 2: Manual Setup
```bash
# Install dependencies
npm install
forge install

# Create environment file
cp .env.example .env

# Compile contracts
forge build

# Run tests
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
- [Algebra Protocol](https://algebra.finance/)
- [Self Protocol](https://self.xyz/)
- [Mento Protocol](https://docs.mento.org/)
- [Foundry Book](https://book.getfoundry.sh/)
- [Uniswap V4 Hooks](https://docs.uniswap.org/sdk/v4/overview)








