import MerchantOnboardingForm from '@/components/MerchantOnboardingForm'
import NetworkSelector from '@/components/NetworkSelector'
import ClientOnly from '@/components/ClientOnly'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Merchant Onboarding</h1>
          <p className="text-gray-600">Complete your identity verification and credit assessment</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Network Selector */}
          <div className="lg:col-span-1">
            <ClientOnly fallback={
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            }>
              <NetworkSelector />
            </ClientOnly>
          </div>
          
          {/* Main Form */}
          <div className="lg:col-span-2">
            <ClientOnly fallback={
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Merchant Onboarding Form</h2>
                  <p className="text-gray-600 mb-6">Loading...</p>
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                  </div>
                </div>
              </div>
            }>
              <MerchantOnboardingForm />
            </ClientOnly>
          </div>
        </div>
      </div>
    </div>
  )
}
