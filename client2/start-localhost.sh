#!/bin/bash

# Merchant Onboarding Frontend - Localhost Startup Script
# This script starts the frontend application on localhost

echo "🚀 Starting Merchant Onboarding Frontend..."
echo "=============================================="

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

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Please run this script from the client2 directory."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies."
    exit 1
fi

echo "✅ Dependencies installed successfully!"

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOF
# WalletConnect Project ID
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your-project-id-here

# Self Protocol Configuration
NEXT_PUBLIC_SELF_PROTOCOL_SCOPE=merchant-onboarding
NEXT_PUBLIC_SELF_PROTOCOL_ENDPOINT=https://api.self.xyz

# Contract Address
NEXT_PUBLIC_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000

# Celo Network RPC URLs
NEXT_PUBLIC_CELO_RPC_URL=https://forno.celo.org
NEXT_PUBLIC_CELO_ALFAJORES_RPC_URL=https://alfajores-forno.celo-testnet.org
NEXT_PUBLIC_CELO_SEPOLIA_RPC_URL=https://sepolia-forno.celo-testnet.org
EOF
    echo "✅ .env.local file created!"
    echo "⚠️  Please update the WalletConnect Project ID in .env.local"
fi

echo "🌐 Starting development server..."
echo "=============================================="
echo "The application will be available at:"
echo "  - Local:   http://localhost:3000"
echo "  - Network: http://[your-ip]:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo "=============================================="

# Start the development server
npm run dev
