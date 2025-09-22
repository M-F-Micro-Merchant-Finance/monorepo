# M²F - Micro Merchant Finance Makefile
# Hardhat Dependencies for Celo-PoS Project

.PHONY: help install setup start dev

# Default target
help: ## Show this help message
	@echo "M²F - Micro Merchant Finance Hardhat Commands"
	@echo "============================================="
	@echo ""
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Installation and Setup
install: ## Install Hardhat dependencies
	@echo "📦 Installing Hardhat dependencies..."
	npm install

setup: install ## Complete Hardhat setup (install + configure)
	@echo "🚀 Setting up M²F Hardhat project..."
	@if [ ! -f .env ]; then \
		echo "📝 Creating .env file..."; \
		cp .env.example .env 2>/dev/null || echo "Please create .env file manually"; \
	fi
	@echo "✅ Hardhat setup complete! Please update .env with your configuration."

# Start Hardhat
start: ## Start Hardhat development environment
	@echo "🛠️  Starting Hardhat development environment..."
	npx hardhat node

dev: start ## Alias for start command
