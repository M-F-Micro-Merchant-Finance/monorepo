# M²F - Micro Merchant Finance Makefile
# Foundry-based setup for Celo-PoS Project

.PHONY: help install setup build test deploy clean

# Default target
help: ## Show this help message
	@echo "M²F - Micro Merchant Finance Foundry Commands"
	@echo "============================================="
	@echo ""
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Installation and Setup
install: ## Install all dependencies (Node.js + Foundry)
	@echo "📦 Installing dependencies..."
	@echo "Installing Node.js dependencies..."
	npm install
	@echo "Installing Foundry dependencies..."
	forge install
	@echo "✅ Dependencies installed successfully!"

setup: install ## Complete project setup (install + configure + build + test)
	@echo "🚀 Setting up M²F project..."
	@if [ ! -f .env ]; then \
		echo "📝 Creating .env file from template..."; \
		echo "# M²F Environment Configuration" > .env; \
		echo "ALCHEMY_API_KEY=your_alchemy_api_key_here" >> .env; \
		echo "CELO_SEPOLIA_EXPLORER_API_KEY=your_celo_sepolia_key" >> .env; \
		echo "CELO_ALFAJORES_EXPLORER_API_KEY=your_celo_alfajores_key" >> .env; \
		echo "PRIVATE_KEY=your_private_key_here" >> .env; \
		echo "CELO_RPC_URL=https://celo-mainnet.g.alchemy.com/v2/\$${ALCHEMY_API_KEY}" >> .env; \
		echo "CELO_SEPOLIA_RPC_URL=https://celo-sepolia.g.alchemy.com/v2/\$${ALCHEMY_API_KEY}" >> .env; \
		echo "CELO_ALFAJORES_RPC_URL=https://celo-alfajores.g.alchemy.com/v2/\$${ALCHEMY_API_KEY}" >> .env; \
		echo "DEVELOPMENT_MODE=true" >> .env; \
		echo "GAS_PRICE_MULTIPLIER=1.0" >> .env; \
		echo "SELF_APP_ID=your_self_app_id" >> .env; \
		echo "SELF_SCOPE_SEED=m2f_merchant_verification" >> .env; \
		echo "✅ .env file created! Please update with your API keys."; \
	else \
		echo "✅ .env file already exists."; \
	fi
	@echo "🔨 Building contracts..."
	forge build
	@echo "🧪 Running initial tests..."
	forge test --match-contract "CDS" --match-test "testDeploy" || echo "⚠️  Some tests may fail without proper configuration"
	@echo "✅ M²F setup complete!"
	@echo ""
	@echo "📋 Next steps:"
	@echo "1. Update .env with your Alchemy API key"
	@echo "2. Add your private key for deployment"
	@echo "3. Run 'make test' to verify everything works"
	@echo "4. Run 'make deploy-alfajores' to deploy to testnet"

# Build contracts
build: ## Build all contracts
	@echo "🔨 Building contracts..."
	forge build
	@echo "✅ Build complete!"

# Test contracts
test: ## Run all tests
	@echo "🧪 Running tests..."
	forge test
	@echo "✅ Tests complete!"

test-gas: ## Run tests with gas reporting
	@echo "🧪 Running tests with gas reporting..."
	forge test --gas-report
	@echo "✅ Gas report complete!"

test-coverage: ## Run tests with coverage
	@echo "🧪 Running tests with coverage..."
	forge coverage
	@echo "✅ Coverage report complete!"

# Deploy contracts
deploy-alfajores: ## Deploy to Celo Alfajores testnet
	@echo "🚀 Deploying to Celo Alfajores..."
	forge script script/Deploy.s.sol --rpc-url celo_alfajores --broadcast --verify
	@echo "✅ Deployment to Alfajores complete!"

deploy-sepolia: ## Deploy to Celo Sepolia testnet
	@echo "🚀 Deploying to Celo Sepolia..."
	forge script script/Deploy.s.sol --rpc-url celo_sepolia --broadcast --verify
	@echo "✅ Deployment to Sepolia complete!"

deploy-mainnet: ## Deploy to Celo Mainnet
	@echo "🚀 Deploying to Celo Mainnet..."
	@echo "⚠️  WARNING: This will deploy to mainnet!"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ]
	forge script script/Deploy.s.sol --rpc-url celo --broadcast --verify
	@echo "✅ Deployment to Mainnet complete!"

# Clean build artifacts
clean: ## Clean build artifacts
	@echo "🧹 Cleaning build artifacts..."
	forge clean
	rm -rf foundry-out/
	rm -rf cache/
	rm -rf broadcast/
	@echo "✅ Clean complete!"

# Development helpers
dev: ## Start development environment (build + test)
	@echo "🛠️  Starting development environment..."
	make build
	make test
	@echo "✅ Development environment ready!"

# Quick verification
verify: ## Verify contracts on block explorer
	@echo "🔍 Verifying contracts..."
	forge verify-contract --chain-id 44787 --num-of-optimizations 200 --watch --etherscan-api-key $${CELO_ALFAJORES_EXPLORER_API_KEY} --constructor-args $(cast abi-encode "constructor(address,address)" "0x4F25983b470f0061CE8654607A9fF624344A6FBa" "0x8d460Ef1587dBE692ACE520e9bBBef25A9ceCa11") $(cat foundry-out/CDSFactory.sol/CDSFactory.json | jq -r '.bytecode.object') CDSFactory
	@echo "✅ Verification complete!"
