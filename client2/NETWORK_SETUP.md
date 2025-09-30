# Network Setup Guide

This guide explains how to configure and use different Celo networks in the Merchant Onboarding application.

## Supported Networks

### 1. Celo Mainnet
- **Chain ID**: 42220
- **RPC URL**: https://forno.celo.org
- **Explorer**: https://celoscan.io
- **Purpose**: Production environment

### 2. Celo Alfajores Testnet
- **Chain ID**: 44787
- **RPC URL**: https://alfajores-forno.celo-testnet.org
- **Explorer**: https://alfajores.celoscan.io
- **Purpose**: Development and testing

### 3. Celo Sepolia Testnet
- **Chain ID**: 11142220
- **RPC URL**: https://sepolia-forno.celo-testnet.org
- **Explorer**: https://sepolia.celoscan.io
- **Purpose**: Latest testnet for development

## Environment Configuration

Create a `.env.local` file in the `client2` directory with the following variables:

```bash
# WalletConnect Project ID
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your-project-id-here

# Self Protocol Configuration
NEXT_PUBLIC_SELF_PROTOCOL_SCOPE=merchant-onboarding
NEXT_PUBLIC_SELF_PROTOCOL_ENDPOINT=https://api.self.xyz

# Celo Network RPC URLs
NEXT_PUBLIC_CELO_RPC_URL=https://forno.celo.org
NEXT_PUBLIC_CELO_ALFAJORES_RPC_URL=https://alfajores-forno.celo-testnet.org
NEXT_PUBLIC_CELO_SEPOLIA_RPC_URL=https://sepolia-forno.celo-testnet.org
```

## Getting Testnet Tokens

### Celo Alfajores Testnet
1. Visit the [Celo Alfajores Faucet](https://faucet.celo.org/alfajores)
2. Connect your wallet
3. Request testnet CELO tokens

### Celo Sepolia Testnet
1. Visit the [Celo Sepolia Faucet](https://faucet.celo.org/sepolia)
2. Connect your wallet
3. Request testnet CELO tokens

## Network Switching

The application includes a network selector that allows users to:
- Switch between Celo Mainnet, Alfajores, and Sepolia
- View current network information
- Access network-specific block explorers

## Wallet Configuration

### MetaMask Setup
1. Open MetaMask
2. Click on the network dropdown
3. Select "Add Network" or "Add Custom RPC"
4. Enter the network details:

**For Celo Sepolia:**
- Network Name: Celo Sepolia
- RPC URL: https://sepolia-forno.celo-testnet.org
- Chain ID: 11142220
- Currency Symbol: CELO
- Block Explorer: https://sepolia.celoscan.io

**For Celo Alfajores:**
- Network Name: Celo Alfajores
- RPC URL: https://alfajores-forno.celo-testnet.org
- Chain ID: 44787
- Currency Symbol: CELO
- Block Explorer: https://alfajores.celoscan.io

**For Celo Mainnet:**
- Network Name: Celo
- RPC URL: https://forno.celo.org
- Chain ID: 42220
- Currency Symbol: CELO
- Block Explorer: https://celoscan.io

## Development Workflow

1. **Start with Sepolia**: Use Celo Sepolia for the latest features and testing
2. **Test on Alfajores**: Use Alfajores for stable testing environment
3. **Deploy to Mainnet**: Use Celo Mainnet for production

## Troubleshooting

### Common Issues
1. **Network not found**: Ensure the network is properly configured in your wallet
2. **Transaction fails**: Check if you have sufficient testnet tokens
3. **RPC errors**: Try using alternative RPC providers

### Alternative RPC Providers
If you experience issues with the default RPC URLs, you can use:
- [Infura](https://infura.io/)
- [Alchemy](https://www.alchemy.com/)
- [QuickNode](https://www.quicknode.com/)

Update the RPC URLs in your `.env.local` file accordingly.

## Security Notes

- Never use mainnet private keys in testnet environments
- Always verify network details before connecting
- Use testnet tokens only for development and testing
- Keep your private keys secure and never share them




