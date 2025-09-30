import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import MerchantOnboardingForm from '../MerchantOnboardingForm'

// Mock wagmi hooks
vi.mock('wagmi', () => ({
  useAccount: () => ({
    address: '0x1234567890123456789012345678901234567890',
    isConnected: true
  }),
  useConnect: () => ({
    connect: vi.fn()
  })
}))

// Mock RainbowKit
vi.mock('@rainbow-me/rainbowkit', () => ({
  ConnectButton: () => <button>Connect Wallet</button>
}))

describe('MerchantOnboardingForm', () => {
  it('renders the form correctly', () => {
    render(<MerchantOnboardingForm />)
    
    expect(screen.getByText('Merchant Onboarding')).toBeInTheDocument()
    expect(screen.getByText('Basic Information')).toBeInTheDocument()
    expect(screen.getByText('Collateral Information')).toBeInTheDocument()
    expect(screen.getByText('Core Risk Metrics (0-100 scale)')).toBeInTheDocument()
  })

  it('auto-fills wallet address when connected', async () => {
    render(<MerchantOnboardingForm />)
    
    // Wait for component to mount
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const walletInput = screen.getByDisplayValue('0x1234567890123456789012345678901234567890')
    expect(walletInput).toBeInTheDocument()
  })

  it('updates form fields correctly', async () => {
    render(<MerchantOnboardingForm />)
    
    // Wait for component to mount
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const businessNameInput = screen.getByPlaceholderText('Enter your business name')
    fireEvent.change(businessNameInput, { target: { value: 'Test Business' } })
    
    expect(businessNameInput).toHaveValue('Test Business')
  })

  it('updates country selection correctly', async () => {
    render(<MerchantOnboardingForm />)
    
    // Wait for component to mount
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const countrySelect = screen.getByDisplayValue('Select a country')
    fireEvent.change(countrySelect, { target: { value: 'USA' } })
    
    expect(countrySelect).toHaveValue('USA')
  })

  it('auto-generates credit assessment ID when business name and country are provided', async () => {
    render(<MerchantOnboardingForm />)
    
    // Wait for component to mount
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const businessNameInput = screen.getByPlaceholderText('Enter your business name')
    const countrySelect = screen.getByDisplayValue('Select a country')
    
    fireEvent.change(businessNameInput, { target: { value: 'Test Business' } })
    fireEvent.change(countrySelect, { target: { value: 'USA' } })
    
    // The credit assessment ID should be auto-generated and displayed
    const creditAssessmentField = screen.getByDisplayValue(/0x[a-fA-F0-9]{64}/)
    expect(creditAssessmentField).toBeInTheDocument()
  })

  it('validates required fields', () => {
    render(<MerchantOnboardingForm />)
    
    const submitButton = screen.getByText('Generate QR Code for Self App')
    fireEvent.click(submitButton)
    
    // Form should not submit without required fields
    expect(screen.getByText('Generate QR Code for Self App')).toBeInTheDocument()
  })

  it('shows QR code when form is submitted with valid data', async () => {
    render(<MerchantOnboardingForm />)
    
    // Wait for component to mount
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const businessNameInput = screen.getByPlaceholderText('Enter your business name')
    const countrySelect = screen.getByDisplayValue('Select a country')
    const submitButton = screen.getByText('Generate QR Code for Self App')
    
    fireEvent.change(businessNameInput, { target: { value: 'Test Business' } })
    fireEvent.change(countrySelect, { target: { value: 'USA' } })
    
    // Wait for credit assessment ID to be generated
    await new Promise(resolve => setTimeout(resolve, 100))
    
    fireEvent.click(submitButton)
    
    // Should show QR code modal with Self app functionality
    await waitFor(() => {
      expect(screen.getByText('Self App Verification')).toBeInTheDocument()
      expect(screen.getByText('Open Self App')).toBeInTheDocument()
      expect(screen.getByText('Copy Self App URL')).toBeInTheDocument()
    }, { timeout: 5000 })
  })
})
