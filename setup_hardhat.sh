#!/bin/bash

# Setup script for Hardhat integration with Foundry
# This script installs Hardhat and its dependencies for the Celo-PoS project

echo "🚀 Setting up Hardhat for Celo-PoS project..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies
echo "📦 Installing Hardhat and dependencies..."
npm install

# Verify installation
echo "✅ Verifying installation..."
if [ -f "node_modules/.bin/hardhat" ]; then
    echo "✅ Hardhat installed successfully"
else
    echo "❌ Hardhat installation failed"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
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
EOF
    echo "✅ .env file created. Please update with your actual values."
else
    echo "ℹ️  .env file already exists"
fi

# Create directories if they don't exist
echo "📁 Creating necessary directories..."
mkdir -p cache
mkdir -p artifacts
mkdir -p dist

# Test compilation
echo "🔨 Testing Hardhat compilation..."
npx hardhat compile

if [ $? -eq 0 ]; then
    echo "✅ Hardhat compilation successful"
else
    echo "❌ Hardhat compilation failed"
    exit 1
fi

echo ""
echo "🎉 Hardhat setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your actual API keys and private key"
echo "2. Run 'npx hardhat test' to run tests"
echo "3. Run 'npx hardhat run script/deploy.ts' to deploy contracts"
echo "4. Use 'forge test' for Foundry tests"
echo "5. Use 'npx hardhat test' for Hardhat tests"
echo ""
echo "Available commands:"
echo "  npx hardhat compile    - Compile contracts"
echo "  npx hardhat test       - Run Hardhat tests"
echo "  npx hardhat run        - Run scripts"
echo "  forge test             - Run Foundry tests"
echo "  forge build            - Build with Foundry"
