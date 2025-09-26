import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { MerchantOnboardingForm } from '../components/MerchantOnboardingForm';

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900">
              Merchant CDS Onboarding
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Complete your merchant profile to access Credit Default Swap services
            </p>
          </div>
          
          <div className="flex justify-center mb-8">
            <ConnectButton />
          </div>
          
          {isConnected ? (
            <MerchantOnboardingForm />
          ) : (
            <div className="text-center py-12">
              <div className="bg-white rounded-lg shadow p-8 max-w-md mx-auto">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Connect Your Wallet
                </h2>
                <p className="text-gray-600 mb-6">
                  Please connect your wallet to continue with the merchant onboarding process.
                </p>
                <ConnectButton />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
