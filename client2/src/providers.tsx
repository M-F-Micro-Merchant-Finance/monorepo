'use client'

import '@rainbow-me/rainbowkit/styles.css'
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { celo, celoAlfajores } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http } from 'viem'
import { config as envConfig } from '@/config/env'
import { celoSepolia } from '@/config/chains'

const config = getDefaultConfig({
  appName: 'Merchant Onboarding',
  projectId: envConfig.walletConnect.projectId,
  chains: [celo, celoAlfajores, celoSepolia],
  transports: {
    [celo.id]: http(envConfig.celo.rpcUrl),
    [celoAlfajores.id]: http(envConfig.celo.alfajoresRpcUrl),
    [celoSepolia.id]: http(envConfig.celo.sepoliaRpcUrl),
  },
})

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
