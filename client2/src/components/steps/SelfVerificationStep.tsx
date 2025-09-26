import React, { useState, useEffect } from 'react';
// import { getUniversalLink } from '@selfxyz/core';
// import { SelfQRcodeWrapper, SelfAppBuilder, type SelfApp } from '@selfxyz/qrcode';
import { keccak256, stringToBytes } from 'viem';
import { MerchantOnboardingFormData } from '../MerchantOnboardingForm';

interface SelfVerificationStepProps {
  form: any;
  onNext: () => void;
  onPrev: () => void;
}

export function SelfVerificationStep({ form, onNext, onPrev }: SelfVerificationStepProps) {
  const [selfApp, setSelfApp] = useState<any | null>(null);
  const [universalLink, setUniversalLink] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  
  // Generate unique user ID based on business information
  const userId = React.useMemo(() => {
    const businessName = form.getValues('businessName');
    const businessType = form.getValues('businessType');
    return keccak256(
      stringToBytes(`${businessName}-${businessType}-${Date.now()}`)
    );
  }, [form]);

  useEffect(() => {
    try {
      // Mock Self app for build time
      const mockApp = {
        qrCode: 'mock-qr-code-data',
        deepLink: 'mock-deep-link',
        verify: async () => ({ verified: true, payload: { attestations: {} } })
      };
      
      setSelfApp(mockApp);
      setUniversalLink('mock-deep-link');
    } catch (error) {
      console.error('Failed to initialize Self app:', error);
    }
  }, [userId, form]);

  const handleSuccessfulVerification = () => {
    console.log('Verification successful!');
    const result = { verified: true, payload: { attestations: {} } };
    setVerificationResult(result);
    setIsVerifying(false);
    
    // Store verification result in form data
    form.setValue('verificationResult', result);
    
    // Move to next step
    onNext();
  };

  const handleVerificationError = (error: any) => {
    console.error('Verification failed:', error);
    setIsVerifying(false);
  };

  const getExcludedCountries = (): string[] => {
    // Return list of excluded countries based on compliance requirements
    return ["IRN", "PRK", "RUS", "SYR"];
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Identity Verification</h2>
        <p className="mt-2 text-gray-600">
          Verify your identity using Self Protocol to complete the onboarding process
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Verification Requirements</h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-1">
              <li>• Must be 18 years or older</li>
              <li>• Valid passport or government-issued ID</li>
              <li>• Not on any sanctions lists</li>
              <li>• From an eligible country</li>
            </ul>
          </div>

          {selfApp && (
            <div className="space-y-4">
              {/* Mobile Deep Link */}
              <div className="md:hidden">
                <button
                  onClick={() => window.open(universalLink, '_blank')}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Open Self App
                </button>
              </div>

              {/* Desktop QR Code */}
              <div className="hidden md:block">
                <div className="text-center">
                  <div className="bg-gray-100 p-8 rounded-lg">
                    <p className="text-gray-600 mb-4">Mock QR Code for Self Protocol Verification</p>
                    <div className="bg-white p-4 rounded border-2 border-dashed border-gray-300">
                      <p className="text-sm text-gray-500">QR Code would appear here</p>
                    </div>
                    <button
                      onClick={handleSuccessfulVerification}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Simulate Verification
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {verificationResult && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Identity Verified Successfully
                  </h3>
                  <p className="mt-1 text-sm text-green-700">
                    Your identity has been verified and you can proceed to the next step.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Previous
        </button>
        
        <button
          type="button"
          onClick={onNext}
          disabled={!verificationResult}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
