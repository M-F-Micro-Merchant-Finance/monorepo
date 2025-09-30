export const config = {
  walletConnect: {
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'your-project-id-here'
  },
  selfProtocol: {
    scope: process.env.NEXT_PUBLIC_SELF_PROTOCOL_SCOPE || 'merchant-onboarding',
    endpoint: process.env.NEXT_PUBLIC_SELF_PROTOCOL_ENDPOINT || 'https://api.self.xyz'
  },
  contract: {
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000'
  },
  celo: {
    rpcUrl: process.env.NEXT_PUBLIC_CELO_RPC_URL || 'https://forno.celo.org',
    alfajoresRpcUrl: process.env.NEXT_PUBLIC_CELO_ALFAJORES_RPC_URL || 'https://alfajores-forno.celo-testnet.org',
    sepoliaRpcUrl: process.env.NEXT_PUBLIC_CELO_SEPOLIA_RPC_URL || 'https://sepolia-forno.celo-testnet.org'
  },
  networks: {
    mainnet: {
      name: 'Celo Mainnet',
      chainId: 42220,
      rpcUrl: process.env.NEXT_PUBLIC_CELO_RPC_URL || 'https://forno.celo.org',
      explorerUrl: 'https://celoscan.io',
      nativeCurrency: { name: 'Celo', symbol: 'CELO', decimals: 18 }
    },
    alfajores: {
      name: 'Celo Alfajores',
      chainId: 44787,
      rpcUrl: process.env.NEXT_PUBLIC_CELO_ALFAJORES_RPC_URL || 'https://alfajores-forno.celo-testnet.org',
      explorerUrl: 'https://alfajores.celoscan.io',
      nativeCurrency: { name: 'Celo', symbol: 'CELO', decimals: 18 }
    },
    sepolia: {
      name: 'Celo Sepolia',
      chainId: 11142220,
      rpcUrl: process.env.NEXT_PUBLIC_CELO_SEPOLIA_RPC_URL || 'https://sepolia-forno.celo-testnet.org',
      explorerUrl: 'https://sepolia.celoscan.io',
      nativeCurrency: { name: 'Celo', symbol: 'CELO', decimals: 18 }
    }
  }
}
