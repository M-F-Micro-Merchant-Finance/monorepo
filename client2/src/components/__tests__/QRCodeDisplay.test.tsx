import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import QRCodeDisplay from '../QRCodeDisplay'
import { SelfProtocolData } from '@/types'

// Mock QRCode library
vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn().mockImplementation(() => 
      Promise.resolve('data:image/png;base64,mock-qr-code')
    )
  }
}))

const mockData: SelfProtocolData = {
  scope: 'merchant-onboarding',
  address: '0x1234567890123456789012345678901234567890',
  merchantData: {
    businessName: 'Test Business',
    countryCode: 'USA',
    businessId: '0xabcdef1234567890',
    countryCodeHash: '0x1234567890abcdef',
    creditAssesmentId: '0xfedcba0987654321',
    collateralAddress: '0x1111111111111111111111111111111111111111',
    collateralType: 0,
    protectionSeller: '0x2222222222222222222222222222222222222222',
    merchantWallet: '0x1234567890123456789012345678901234567890',
    creditScore: 85,
    defaultProbability: 15,
    lossGivenDefault: 25,
    recoveryRate: 75,
    businessAgeScore: 80,
    revenueStabilityScore: 70,
    marketPositionScore: 90,
    industryRiskScore: 30,
    regulatoryComplianceScore: 95,
    liquidityScore: 85,
    leverageScore: 60,
    cashFlowScore: 75,
    profitabilityScore: 80,
    marketVolatility: 40,
    economicCyclePosition: 3,
    regulatoryStability: 4,
    seasonality: 2
  }
}

describe('QRCodeDisplay', () => {
  it('renders the QR code modal correctly', async () => {
    const onClose = vi.fn()
    render(<QRCodeDisplay data={mockData} onClose={onClose} />)
    
    expect(screen.getByText('Self App Verification')).toBeInTheDocument()
    expect(screen.getByText('Scan this QR code with the Self App to complete your identity verification')).toBeInTheDocument()
    
    // Wait for the QR code to generate and buttons to appear
    await waitFor(() => {
      expect(screen.getByText('Open Self App')).toBeInTheDocument()
      expect(screen.getByText('Copy Self App URL')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('shows loading state initially', () => {
    const onClose = vi.fn()
    render(<QRCodeDisplay data={mockData} onClose={onClose} />)
    
    // Should show loading spinner initially
    expect(screen.getByRole('button', { name: '×' })).toBeInTheDocument()
    expect(screen.getByText('Self App Verification')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(<QRCodeDisplay data={mockData} onClose={onClose} />)
    
    const closeButton = screen.getByText('×')
    fireEvent.click(closeButton)
    
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('displays verification data', () => {
    const onClose = vi.fn()
    render(<QRCodeDisplay data={mockData} onClose={onClose} />)
    
    expect(screen.getByText('Verification Data:')).toBeInTheDocument()
    // Check for data in the JSON display
    expect(screen.getByText(/merchant-onboarding/)).toBeInTheDocument()
    expect(screen.getByText(/Test Business/)).toBeInTheDocument()
  })

  it('shows instructions for Self App usage', () => {
    const onClose = vi.fn()
    render(<QRCodeDisplay data={mockData} onClose={onClose} />)
    
    expect(screen.getByText('Instructions:')).toBeInTheDocument()
    expect(screen.getByText('1. Click "Open Self App" or scan the QR code with your mobile device')).toBeInTheDocument()
    expect(screen.getByText('2. Complete the identity verification process in the Self App')).toBeInTheDocument()
    expect(screen.getByText('3. Your verification will be automatically processed')).toBeInTheDocument()
    expect(screen.getByText('4. Return to this page to continue with your application')).toBeInTheDocument()
  })

  it('opens Self app when button is clicked', async () => {
    const onClose = vi.fn()
    const mockOpen = vi.fn()
    window.open = mockOpen
    
    render(<QRCodeDisplay data={mockData} onClose={onClose} />)
    
    // Wait for buttons to appear
    await waitFor(() => {
      expect(screen.getByText('Open Self App')).toBeInTheDocument()
    }, { timeout: 3000 })
    
    const openButton = screen.getByText('Open Self App')
    fireEvent.click(openButton)
    
    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining('self://verify'),
      '_blank'
    )
  })

  it('copies Self app URL to clipboard', async () => {
    const onClose = vi.fn()
    const mockWriteText = vi.fn()
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    })
    
    render(<QRCodeDisplay data={mockData} onClose={onClose} />)
    
    // Wait for buttons to appear
    await waitFor(() => {
      expect(screen.getByText('Copy Self App URL')).toBeInTheDocument()
    }, { timeout: 3000 })
    
    const copyButton = screen.getByText('Copy Self App URL')
    fireEvent.click(copyButton)
    
    expect(mockWriteText).toHaveBeenCalledWith(
      expect.stringContaining('self://verify')
    )
  })
})
