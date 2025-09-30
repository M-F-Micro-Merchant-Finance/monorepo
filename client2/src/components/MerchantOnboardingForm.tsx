'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { MerchantOnboardingData, CollateralType } from '@/types'
import { useSelfProtocol } from '@/hooks/useSelfProtocol'
import { COUNTRY_CODES } from '@/utils/countryCodes'
import { generateCreditAssessmentId, hashBusinessData } from '@/utils/hashing'
import QRCodeDisplay from './QRCodeDisplay'

export default function MerchantOnboardingForm() {
  const { address, isConnected } = useAccount()
  const { startVerification, isVerifying, verificationData } = useSelfProtocol()
  
  const [formData, setFormData] = useState<MerchantOnboardingData>({
    businessName: '',
    countryCode: '',
    businessId: '',
    countryCodeHash: '',
    creditAssesmentId: '', // Will be auto-generated
    collateralAddress: '',
    collateralType: CollateralType.CURRENCY,
    protectionSeller: '',
    merchantWallet: '',
    creditScore: 0,
    defaultProbability: 0,
    lossGivenDefault: 0,
    recoveryRate: 0,
    businessAgeScore: 0,
    revenueStabilityScore: 0,
    marketPositionScore: 0,
    industryRiskScore: 0,
    regulatoryComplianceScore: 0,
    liquidityScore: 0,
    leverageScore: 0,
    cashFlowScore: 0,
    profitabilityScore: 0,
    marketVolatility: 0,
    economicCyclePosition: 1,
    regulatoryStability: 1,
    seasonality: 1,
  })

  const [showQR, setShowQR] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Set mounted state to prevent hydration issues
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Auto-fill wallet address when connected
  useEffect(() => {
    if (isConnected && address) {
      setFormData(prev => ({
        ...prev,
        merchantWallet: address
      }))
    }
  }, [isConnected, address])

  // Auto-generate hashes when business name or country changes
  useEffect(() => {
    if (formData.businessName && formData.countryCode) {
      const creditAssessmentId = generateCreditAssessmentId(formData.businessName, formData.countryCode)
      const { businessId, countryCodeHash } = hashBusinessData(formData.businessName, formData.countryCode)
      
      setFormData(prev => ({
        ...prev,
        businessId,
        countryCodeHash,
        creditAssesmentId: creditAssessmentId
      }))
    }
  }, [formData.businessName, formData.countryCode])

  const handleInputChange = (field: keyof MerchantOnboardingData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }

    try {
      await startVerification(formData)
      setShowQR(true)
    } catch (error) {
      console.error('Verification failed:', error)
      alert('Verification failed. Please try again.')
    }
  }

  const renderScoreInput = (label: string, field: keyof MerchantOnboardingData, value: number) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} ({value}/100)
      </label>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => handleInputChange(field, parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  )

  const renderSelectInput = (label: string, field: keyof MerchantOnboardingData, value: number, options: { value: number; label: string }[]) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => handleInputChange(field, parseInt(e.target.value))}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )

  if (showQR && verificationData) {
    return (
      <>
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Identity Verification</h2>
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Your verification data has been prepared. Click the button below to generate a QR code for the Self App.
            </p>
            <button
              onClick={() => setShowQR(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Back to Form
            </button>
          </div>
        </div>
        <QRCodeDisplay data={verificationData} onClose={() => setShowQR(false)} />
      </>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Merchant Onboarding</h1>
        <p className="text-gray-600">Complete your identity verification to access micro-finance services</p>
      </div>

      <div className="mb-6">
        {isMounted ? (
          <ConnectButton />
        ) : (
          <div className="flex justify-center">
            <div className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg">
              Loading wallet connection...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your business name"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <select
                value={formData.countryCode}
                onChange={(e) => handleInputChange('countryCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a country</option>
                {COUNTRY_CODES.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name} ({country.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Merchant Wallet (Auto-filled)
              </label>
              <input
                type="text"
                value={isMounted ? formData.merchantWallet : 'Connect wallet to auto-fill'}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Credit Assessment ID (Auto-generated)
              </label>
              <input
                type="text"
                value={isMounted ? (formData.creditAssesmentId || 'Will be generated from business name + country') : 'Loading...'}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Protection Seller Address
              </label>
              <input
                type="text"
                value={formData.protectionSeller}
                onChange={(e) => handleInputChange('protectionSeller', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter protection seller wallet address"
                required
              />
            </div>
          </div>
        </div>

        {/* Collateral Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Collateral Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Collateral Address
              </label>
              <input
                type="text"
                value={formData.collateralAddress}
                onChange={(e) => handleInputChange('collateralAddress', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Collateral Type
              </label>
              <select
                value={formData.collateralType}
                onChange={(e) => handleInputChange('collateralType', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={CollateralType.CURRENCY}>Currency</option>
                <option value={CollateralType.NFT}>NFT</option>
                <option value={CollateralType.CRYPTO}>Crypto</option>
                <option value={CollateralType.REAL_ESTATE}>Real Estate</option>
                <option value={CollateralType.OTHER}>Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Core Risk Metrics */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Core Risk Metrics (0-100 scale)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderScoreInput('Credit Score', 'creditScore', formData.creditScore)}
            {renderScoreInput('Default Probability', 'defaultProbability', formData.defaultProbability)}
            {renderScoreInput('Loss Given Default', 'lossGivenDefault', formData.lossGivenDefault)}
            {renderScoreInput('Recovery Rate', 'recoveryRate', formData.recoveryRate)}
          </div>
        </div>

        {/* Business Fundamentals */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Business Fundamentals (0-100 scale)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderScoreInput('Business Age Score', 'businessAgeScore', formData.businessAgeScore)}
            {renderScoreInput('Revenue Stability Score', 'revenueStabilityScore', formData.revenueStabilityScore)}
            {renderScoreInput('Market Position Score', 'marketPositionScore', formData.marketPositionScore)}
            {renderScoreInput('Industry Risk Score', 'industryRiskScore', formData.industryRiskScore)}
            {renderScoreInput('Regulatory Compliance Score', 'regulatoryComplianceScore', formData.regulatoryComplianceScore)}
          </div>
        </div>

        {/* Financial Health */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Financial Health (0-100 scale)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderScoreInput('Liquidity Score', 'liquidityScore', formData.liquidityScore)}
            {renderScoreInput('Leverage Score', 'leverageScore', formData.leverageScore)}
            {renderScoreInput('Cash Flow Score', 'cashFlowScore', formData.cashFlowScore)}
            {renderScoreInput('Profitability Score', 'profitabilityScore', formData.profitabilityScore)}
          </div>
        </div>

        {/* Risk Factors */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Risk Factors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderScoreInput('Market Volatility', 'marketVolatility', formData.marketVolatility)}
            {renderSelectInput('Economic Cycle Position', 'economicCyclePosition', formData.economicCyclePosition, [
              { value: 1, label: 'Recession' },
              { value: 2, label: 'Recovery' },
              { value: 3, label: 'Expansion' },
              { value: 4, label: 'Peak' },
              { value: 5, label: 'Contraction' }
            ])}
            {renderSelectInput('Regulatory Stability', 'regulatoryStability', formData.regulatoryStability, [
              { value: 1, label: 'Very Unstable' },
              { value: 2, label: 'Unstable' },
              { value: 3, label: 'Moderate' },
              { value: 4, label: 'Stable' },
              { value: 5, label: 'Very Stable' }
            ])}
            {renderSelectInput('Seasonality', 'seasonality', formData.seasonality, [
              { value: 1, label: 'No Seasonal Impact' },
              { value: 2, label: 'Low Seasonal Impact' },
              { value: 3, label: 'Moderate Seasonal Impact' },
              { value: 4, label: 'High Seasonal Impact' },
              { value: 5, label: 'Very High Seasonal Impact' }
            ])}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!isMounted || !isConnected || isVerifying}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {!isMounted ? 'Loading...' : isVerifying ? 'Generating QR Code...' : 'Generate QR Code for Self App'}
          </button>
        </div>
      </form>
    </div>
  )
}
