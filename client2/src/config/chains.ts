import { defineChain } from 'viem'
import { celo, celoAlfajores } from 'wagmi/chains'

// Celo Sepolia testnet chain definition
export const celoSepolia = defineChain({
  id: 11142220,
  name: 'Celo Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Celo',
    symbol: 'CELO',
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia-forno.celo-testnet.org'],
    },
    public: {
      http: ['https://sepolia-forno.celo-testnet.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Celo Explorer',
      url: 'https://sepolia.celoscan.io',
    },
  },
  testnet: true,
})

// Export all supported chains
export const supportedChains = {
  celo: celo,
  celoAlfajores: celoAlfajores,
  celoSepolia: celoSepolia,
}
