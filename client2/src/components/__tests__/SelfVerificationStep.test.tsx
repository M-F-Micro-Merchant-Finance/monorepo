import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../test/test-utils';
import { SelfVerificationStep } from '../steps/SelfVerificationStep';
import { createMockForm } from '../../test/test-utils';

// Mock Self Protocol modules
jest.mock('@selfxyz/qrcode', () => ({
  SelfQRcodeWrapper: ({ onSuccess, onError }: any) => {
    // Simulate successful verification
    React.useEffect(() => {
      const timer = setTimeout(() => {
        onSuccess({
          isValid: true,
          credentialSubject: { nationality: 'US', age: 25 },
          attestationId: 1,
          proof: 'mock-proof',
          publicSignals: ['mock-signal'],
          userContextData: 'mock-context',
        });
      }, 100);
      return () => clearTimeout(timer);
    }, [onSuccess]);
    
    return <div data-testid="qr-code">QR Code Component</div>;
  },
  SelfAppBuilder: jest.fn().mockImplementation(() => ({
    build: jest.fn().mockReturnValue({
      version: 2,
      appName: 'Test App',
      scope: 'test-scope',
      endpoint: 'https://test.self.xyz/api/verify',
      userId: '0x1234567890abcdef',
      userDefinedData: 'test-data',
      disclosures: { minimumAge: 18, nationality: true, gender: false },
    }),
  })),
}));

jest.mock('@selfxyz/core', () => ({
  getUniversalLink: jest.fn().mockReturnValue('https://test.self.xyz/verify?data=mock'),
}));

jest.mock('ethers', () => ({
  utils: {
    keccak256: jest.fn().mockReturnValue('0x1234567890abcdef1234567890abcdef12345678'),
    toUtf8Bytes: jest.fn().mockReturnValue(new Uint8Array([1, 2, 3, 4])),
  },
}));

describe('SelfVerificationStep', () => {
  const mockOnNext = jest.fn();
  const mockOnPrev = jest.fn();
  const mockForm = createMockForm();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders verification requirements', () => {
    render(
      <SelfVerificationStep
        form={mockForm}
        onNext={mockOnNext}
        onPrev={mockOnPrev}
      />
    );

    expect(screen.getByText('Identity Verification')).toBeInTheDocument();
    expect(screen.getByText('Must be 18 years or older')).toBeInTheDocument();
    expect(screen.getByText('Valid passport or government-issued ID')).toBeInTheDocument();
    expect(screen.getByText('Not on any sanctions lists')).toBeInTheDocument();
    expect(screen.getByText('From an eligible country')).toBeInTheDocument();
  });

  it('shows QR code component on desktop', () => {
    render(
      <SelfVerificationStep
        form={mockForm}
        onNext={mockOnNext}
        onPrev={mockOnPrev}
      />
    );

    expect(screen.getByTestId('qr-code')).toBeInTheDocument();
  });

  it('shows deep link button on mobile', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    render(
      <SelfVerificationStep
        form={mockForm}
        onNext={mockOnNext}
        onPrev={mockOnPrev}
      />
    );

    expect(screen.getByText('Open Self App')).toBeInTheDocument();
  });

  it('handles successful verification', async () => {
    render(
      <SelfVerificationStep
        form={mockForm}
        onNext={mockOnNext}
        onPrev={mockOnPrev}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Identity Verified Successfully')).toBeInTheDocument();
    });

    expect(mockOnNext).toHaveBeenCalled();
    expect(mockForm.setValue).toHaveBeenCalledWith('verificationResult', expect.any(Object));
  });

  it('handles verification error', async () => {
    // Mock error scenario
    jest.doMock('@selfxyz/qrcode', () => ({
      SelfQRcodeWrapper: ({ onError }: any) => {
        React.useEffect(() => {
          const timer = setTimeout(() => {
            onError(new Error('Verification failed'));
          }, 100);
          return () => clearTimeout(timer);
        }, [onError]);
        
        return <div data-testid="qr-code">QR Code Component</div>;
      },
      SelfAppBuilder: jest.fn().mockImplementation(() => ({
        build: jest.fn().mockReturnValue({}),
      })),
    }));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    render(
      <SelfVerificationStep
        form={mockForm}
        onNext={mockOnNext}
        onPrev={mockOnPrev}
      />
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Verification failed:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('navigates to previous step when previous button is clicked', () => {
    render(
      <SelfVerificationStep
        form={mockForm}
        onNext={mockOnNext}
        onPrev={mockOnPrev}
      />
    );

    const prevButton = screen.getByText('Previous');
    fireEvent.click(prevButton);

    expect(mockOnPrev).toHaveBeenCalled();
  });

  it('disables next button until verification is complete', () => {
    render(
      <SelfVerificationStep
        form={mockForm}
        onNext={mockOnNext}
        onPrev={mockOnPrev}
      />
    );

    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeDisabled();
  });

  it('enables next button after successful verification', async () => {
    render(
      <SelfVerificationStep
        form={mockForm}
        onNext={mockOnNext}
        onPrev={mockOnPrev}
      />
    );

    await waitFor(() => {
      const nextButton = screen.getByText('Next');
      expect(nextButton).not.toBeDisabled();
    });
  });

  it('generates unique user ID based on business information', () => {
    const mockFormWithData = createMockForm({
      getValues: jest.fn().mockReturnValue({
        businessName: 'Test Business',
        businessType: 'sole_proprietorship',
      }),
    });

    render(
      <SelfVerificationStep
        form={mockFormWithData}
        onNext={mockOnNext}
        onPrev={mockOnPrev}
      />
    );

    expect(mockFormWithData.getValues).toHaveBeenCalledWith('businessName');
    expect(mockFormWithData.getValues).toHaveBeenCalledWith('businessType');
  });
});
