'use client'

import { useAccount, useSwitchChain } from 'wagmi'
import { config } from '@/config/env'
import { celo, celoAlfajores } from 'wagmi/chains'
import { celoSepolia } from '@/config/chains'

const networks = [
  {
    chain: celo,
    name: config.networks.mainnet.name,
    icon: '🌐'
  },
  {
    chain: celoAlfajores,
    name: config.networks.alfajores.name,
    icon: '🧪'
  },
  {
    chain: celoSepolia,
    name: config.networks.sepolia.name,
    icon: '🔬'
  }
]

export default function NetworkSelector() {
  const { chain } = useAccount()
  const { switchChain } = useSwitchChain()

  const handleNetworkChange = (chainId: number) => {
    switchChain({ chainId })
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Network</h3>
      <div className="space-y-2">
        {networks.map((network) => (
          <button
            key={network.chain.id}
            onClick={() => handleNetworkChange(network.chain.id)}
            className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
              chain?.id === network.chain.id
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl">{network.icon}</span>
              <div className="text-left">
                <div className="font-medium">{network.name}</div>
                <div className="text-sm text-gray-500">
                  Chain ID: {network.chain.id}
                </div>
              </div>
            </div>
            {chain?.id === network.chain.id && (
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </button>
        ))}
      </div>
      
      {chain && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">
            <strong>Current Network:</strong> {networks.find(n => n.chain.id === chain.id)?.name || 'Unknown'}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Chain ID: {chain.id} | Block Explorer: {networks.find(n => n.chain.id === chain.id)?.chain.blockExplorers?.default?.url || 'N/A'}
          </div>
        </div>
      )}
    </div>
  )
}




