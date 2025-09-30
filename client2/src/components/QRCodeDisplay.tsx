'use client'

import React, { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { SelfProtocolData } from '@/types'

interface QRCodeDisplayProps {
  data: SelfProtocolData
  onClose: () => void
}

export default function QRCodeDisplay({ data, onClose }: QRCodeDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [selfAppUrl, setSelfAppUrl] = useState<string>('')

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        setIsLoading(true)
        
        // Create the Self App deep link URL with the merchant data
        const selfAppData = {
          scope: data.scope,
          address: data.address,
          merchantData: data.merchantData
        }
        
        // Create Self app deep link URL
        const selfAppUrl = `self://verify?data=${encodeURIComponent(JSON.stringify(selfAppData))}`
        setSelfAppUrl(selfAppUrl)
        
        // Generate QR code with Self app URL
        const qrCodeDataUrl = await QRCode.toDataURL(selfAppUrl, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })

        setQrDataUrl(qrCodeDataUrl)
      } catch (error) {
        console.error('Error generating QR code:', error)
      } finally {
        setIsLoading(false)
      }
    }

    generateQRCode()
  }, [data])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(selfAppUrl)
      alert('Self app URL copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  const openSelfApp = () => {
    window.open(selfAppUrl, '_blank')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Self App Verification</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Scan this QR code with the Self App to complete your identity verification
          </p>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : qrDataUrl ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img 
                  src={qrDataUrl} 
                  alt="Self App QR Code" 
                  className="border border-gray-300 rounded-lg"
                />
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={openSelfApp}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 mb-2"
                >
                  Open Self App
                </button>
                
                <button
                  onClick={copyToClipboard}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Copy Self App URL
                </button>
                
                <div className="text-xs text-gray-500 bg-gray-100 p-3 rounded">
                  <p className="font-semibold mb-1">Instructions:</p>
                  <ol className="text-left space-y-1">
                    <li>1. Click &quot;Open Self App&quot; or scan the QR code with your mobile device</li>
                    <li>2. Complete the identity verification process in the Self App</li>
                    <li>3. The merchant data will be automatically filled in the Self App</li>
                    <li>4. Complete verification and return to this page</li>
                  </ol>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-red-600">
              Failed to generate QR code. Please try again.
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            <p className="font-semibold mb-2">Verification Data:</p>
            <div className="bg-gray-50 p-2 rounded text-left max-h-32 overflow-y-auto">
              <pre className="text-xs whitespace-pre-wrap">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}