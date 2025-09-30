'use client'

import { useState, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { MerchantOnboardingData, SelfProtocolData } from '@/types'
import { hashBusinessData, generateCreditAssessmentId } from '@/utils/hashing'
import { generateScopeFromSettings } from '@/utils/scope'
import { config } from '@/config/env'

export function useSelfProtocol() {
  const { address } = useAccount()
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationData, setVerificationData] = useState<SelfProtocolData | null>(null)

  const generateQRData = useCallback((merchantData: MerchantOnboardingData) => {
    if (!address) {
      throw new Error('Wallet not connected')
    }

    // Hash the business name and country code
    const hashedData = hashBusinessData(merchantData.businessName, merchantData.countryCode)
    
    // Generate credit assessment ID from combined business name and country code
    const creditAssessmentId = generateCreditAssessmentId(merchantData.businessName, merchantData.countryCode)

    // Generate scope from frontend settings
    const contractAddress = config.contract.address
    const scope = generateScopeFromSettings(contractAddress)

    const selfData: SelfProtocolData = {
      scope: scope,
      address: address,
      merchantData: {
        ...merchantData,
        businessId: hashedData.businessId,
        countryCodeHash: hashedData.countryCodeHash,
        creditAssesmentId: creditAssessmentId,
        merchantWallet: address, // Auto-fill with connected wallet
      }
    }

    setVerificationData(selfData)
    return selfData
  }, [address])

  const startVerification = useCallback(async (merchantData: MerchantOnboardingData) => {
    setIsVerifying(true)
    try {
      const qrData = generateQRData(merchantData)
      
      // In a real implementation, this would integrate with Self Protocol
      // For now, we'll simulate the verification process
      console.log('Starting Self Protocol verification with data:', qrData)
      
      // Simulate verification process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      return qrData
    } catch (error) {
      console.error('Verification failed:', error)
      throw error
    } finally {
      setIsVerifying(false)
    }
  }, [generateQRData])

  const formatForQR = useCallback((data: SelfProtocolData) => {
    return JSON.stringify(data, null, 2)
  }, [])

  return {
    isVerifying,
    verificationData,
    startVerification,
    formatForQR,
    isConnected: !!address,
    walletAddress: address
  }
}
