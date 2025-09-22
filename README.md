# M²F - Micro Merchant Finance


<div align="center">

  <img src="https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity&logoColor=white" alt="Solidity"/>
  <img src="https://img.shields.io/badge/Celo-FFDE21?style=for-the-badge&logo=ethereum&logoColor=white" alt="Celo"/>
  <img src="https://img.shields.io/badge/Algebra-00CED1?style=for-the-badge&logo=uniswap&logoColor=white" alt="Algebra"/>
  <img src="https://img.shields.io/badge/Self-06402B?style=for-the-badge&logo=uniswap&logoColor=white" alt="Self"/>

</div>

<p align="center">
  <img src="assets/logo.png" alt="Description" width="300"/>
</p>


## Table of Contents
  - [Table of Contents](#table-of-contents)
  - [Demo](#demo)
  - [Problem Description](#problem-description)
  - [Solution Overview](#solution-overview)
  - [Arquitecture](#arquitecture)
  - [Setup](#setup)
    - [Build](#build)
    - [Test](#test)
    - [Deploy](#deploy)
  - [References](#references)

## Demo


##  Problem Description


## Solution Overview


### Core Solution Architecture


## Architecture


## Key-Metrics

## Deployed Contracts


## Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- [Git](https://git-scm.com/)

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd Celo-PoS

# Run quick setup (installs dependencies, compiles, and tests)
make quick-start

# Deploy to Celo Alfajores testnet
make deploy-alfajores
```

### Installation

#### Option 1: Automated Setup (Recommended)
```bash
# Complete setup with one command
make setup
```

#### Option 2: Manual Setup
```bash
# Install dependencies
make install

# Or install individually
npm install
forge install

# Compile contracts
make compile

# Run tests
make test
```

### Environment Configuration

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Update `.env` with your configuration:
```env
# Celo Network RPC URLs
CELO_RPC_URL=https://forno.celo.org
CELO_ALFAJORES_RPC_URL=https://alfajores-forno.celo-testnet.org
CELO_BAKLAVA_RPC_URL=https://baklava-forno.celo-testnet.org

# API Keys
CELO_API_KEY=your_celo_api_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Private Key (for deployment)
PRIVATE_KEY=your_private_key_here

# Gas Reporting
REPORT_GAS=true
```

### Available Make Commands

#### 🚀 Hardhat Commands
```bash
make help             # Show all available commands
make install          # Install Hardhat dependencies
make setup            # Complete Hardhat setup (install + configure)
make start            # Start Hardhat development environment
make dev              # Alias for start command
```

#### 📦 Installation & Setup
```bash
make install          # Install Hardhat dependencies (npm)
make setup            # Complete Hardhat setup
```

#### 🛠️ Development
```bash
make start            # Start Hardhat development environment
make dev              # Alias for start command
```

### Development Workflow

#### 1. Initial Setup
```bash
# Clone and setup
git clone <repository-url>
cd Celo-PoS
make setup
```

#### 2. Start Hardhat Development Environment
```bash
# Start Hardhat node
make start

# Or use the alias
make dev
```

#### 3. Additional Hardhat Commands
```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to testnet
npx hardhat run script/deploy.ts --network celoAlfajores

# Start Hardhat console
npx hardhat console --network celoAlfajores
```

### Network Configuration

The project supports multiple Celo networks:

| Network | Chain ID | RPC URL | Purpose |
|---------|----------|---------|---------|
| **Celo Mainnet** | 42220 | `https://forno.celo.org` | Production |
| **Celo Alfajores** | 44787 | `https://alfajores-forno.celo-testnet.org` | Testing |
| **Celo Baklava** | 62320 | `https://baklava-forno.celo-testnet.org` | Testing |

### Hardhat vs Foundry

This project uses both Hardhat and Foundry for maximum flexibility:

- **Hardhat**: TypeScript integration, deployment scripts, testing framework
- **Foundry**: Gas-optimized testing, fuzzing, advanced debugging

#### When to use what:
- **Hardhat**: Deployment, TypeScript integration, complex test scenarios
- **Foundry**: Unit tests, gas optimization, fuzzing, debugging


## References








