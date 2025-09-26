import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SelfVerificationStep } from '../steps/SelfVerificationStep';
import { SelfAppBuilder } from '@selfxyz/core';
import { QRCode } from '@selfxyz/qrcode';

// Mock the Self Protocol modules
jest.mock('@selfxyz/core', () => ({
  SelfAppBuilder: jest.fn(),
  getUniversalLink: jest.fn(() => 'https://self.xyz/verify?token=mock-token'),
}));

jest.mock('@selfxyz/qrcode', () => ({
  QRCode: jest.fn(({ onScanned, value }) => {
    // Simulate QR code scan after a delay
    setTimeout(() => {
      if (onScanned) {
        onScanned(value);
      }
    }, 100);
    return <div data-testid="qr-code">QR Code Component</div>;
  }),
  SelfQRcodeWrapper: jest.fn(({ selfApp, onSuccess, onError }) => {
    // Simulate successful verification
    setTimeout(() => {
      if (onSuccess) {
        onSuccess({
          verified: true,
          payload: {
            attestations: {
              'self_id.age_over_18': { value: true },
              'self_id.nationality': { value: 'US' },
            },
          },
        });
      }
    }, 200);
    return <div data-testid="qr-wrapper">QR Wrapper Component</div>;
  }),
}));

// Mock ethers
jest.mock('ethers', () => ({
  utils: {
    keccak256: jest.fn((value) => `0x${Buffer.from(value).toString('hex')}`),
    toUtf8Bytes: jest.fn((value) => new TextEncoder().encode(value)),
  },
}));

describe('Self Protocol Integration Tests', () => {
  const mockForm = {
    getValues: jest.fn((field) => {
      const values = {
        businessName: 'Test Business',
        businessType: 'sole_proprietorship',
        industry: 'Technology',
        'complianceProfile.jurisdiction': 'US',
      };
      return values[field];
    }),
    setValue: jest.fn(),
    watch: jest.fn(),
    control: {},
    register: jest.fn(),
    handleSubmit: jest.fn(),
    formState: { errors: {} },
    trigger: jest.fn(),
    clearErrors: jest.fn(),
    setError: jest.fn(),
  };

  const mockOnNext = jest.fn();
  const mockOnPrev = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock SelfAppBuilder to return a mock app
    (SelfAppBuilder as jest.Mock).mockImplementation(() => ({
      build: jest.fn().mockReturnValue({
        version: 2,
        appName: 'Merchant CDS Onboarding',
        scope: 'merchant-cds-verification',
        endpoint: 'https://api.self.xyz/verify',
        userId: 'mock-user-id',
      }),
    }));
  });

  describe('QR Code Generation', () => {
    test('generates QR code successfully for desktop users', async () => {
      render(
        <SelfVerificationStep 
          form={mockForm} 
          onNext={mockOnNext} 
          onPrev={mockOnPrev} 
        />
      );

      // Wait for QR code to be rendered
      await waitFor(() => {
        expect(screen.getByTestId('qr-wrapper')).toBeInTheDocument();
      });

      // Verify SelfAppBuilder was called with correct parameters
      expect(SelfAppBuilder).toHaveBeenCalledWith({
        version: 2,
        appName: 'Merchant CDS Onboarding',
        scope: 'merchant-cds-verification',
        endpoint: 'https://api.self.xyz/verify',
        logoBase64: 'https://i.postimg.cc/mrmVf9hm/self.png',
        userId: expect.any(String),
        endpointType: 'staging_https',
        userIdType: 'hex',
        userDefinedData: expect.any(String),
        disclosures: {
          minimumAge: 18,
          nationality: true,
          gender: false,
          excludedCountries: ['IRN', 'PRK', 'RUS', 'SYR'],
          ofac: true,
        },
      });
    });

    test('handles QR code generation errors gracefully', async () => {
      // Mock SelfAppBuilder to throw an error
      (SelfAppBuilder as jest.Mock).mockImplementation(() => {
        throw new Error('QR code generation failed');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(
        <SelfVerificationStep 
          form={mockForm} 
          onNext={mockOnNext} 
          onPrev={mockOnPrev} 
        />
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to initialize Self app:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Deep Link Generation', () => {
    test('generates universal link correctly for mobile users', async () => {
      // Mock window.open for mobile testing
      const mockOpen = jest.fn();
      Object.defineProperty(window, 'open', {
        value: mockOpen,
        writable: true,
      });

      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        value: 375,
        writable: true,
      });

      render(
        <SelfVerificationStep 
          form={mockForm} 
          onNext={mockOnNext} 
          onPrev={mockOnPrev} 
        />
      );

      // Wait for deep link button to be rendered
      await waitFor(() => {
        expect(screen.getByText('Open Self App')).toBeInTheDocument();
      });

      // Click the deep link button
      fireEvent.click(screen.getByText('Open Self App'));

      expect(mockOpen).toHaveBeenCalledWith('https://self.xyz/verify?token=mock-token', '_blank');
    });

    test('shows deep link button on mobile viewport', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        value: 375,
        writable: true,
      });

      render(
        <SelfVerificationStep 
          form={mockForm} 
          onNext={mockOnNext} 
          onPrev={mockOnPrev} 
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Open Self App')).toBeInTheDocument();
        expect(screen.queryByTestId('qr-wrapper')).not.toBeInTheDocument();
      });
    });

    test('shows QR code on desktop viewport', async () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        value: 1024,
        writable: true,
      });

      render(
        <SelfVerificationStep 
          form={mockForm} 
          onNext={mockOnNext} 
          onPrev={mockOnPrev} 
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('qr-wrapper')).toBeInTheDocument();
        expect(screen.queryByText('Open Self App')).not.toBeInTheDocument();
      });
    });
  });

  describe('App Initialization', () => {
    test('initializes Self app with correct configuration parameters', async () => {
      render(
        <SelfVerificationStep 
          form={mockForm} 
          onNext={mockOnNext} 
          onPrev={mockOnPrev} 
        />
      );

      await waitFor(() => {
        expect(SelfAppBuilder).toHaveBeenCalledWith({
          version: 2,
          appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || 'Merchant CDS Onboarding',
          scope: process.env.NEXT_PUBLIC_SELF_SCOPE || 'merchant-cds-verification',
          endpoint: `${process.env.NEXT_PUBLIC_SELF_ENDPOINT}/api/verify`,
          logoBase64: 'https://i.postimg.cc/mrmVf9hm/self.png',
          userId: expect.any(String),
          endpointType: 'staging_https',
          userIdType: 'hex',
          userDefinedData: expect.any(String),
          disclosures: {
            minimumAge: 18,
            nationality: true,
            gender: false,
            excludedCountries: ['IRN', 'PRK', 'RUS', 'SYR'],
            ofac: true,
          },
        });
      });
    });

    test('uses environment variables for configuration', async () => {
      // Set environment variables
      process.env.NEXT_PUBLIC_SELF_APP_NAME = 'Custom App Name';
      process.env.NEXT_PUBLIC_SELF_SCOPE = 'custom-scope';
      process.env.NEXT_PUBLIC_SELF_ENDPOINT = 'https://custom.api.self.xyz';

      render(
        <SelfVerificationStep 
          form={mockForm} 
          onNext={mockOnNext} 
          onPrev={mockOnPrev} 
        />
      );

      await waitFor(() => {
        expect(SelfAppBuilder).toHaveBeenCalledWith(
          expect.objectContaining({
            appName: 'Custom App Name',
            scope: 'custom-scope',
            endpoint: 'https://custom.api.self.xyz/api/verify',
          })
        );
      });
    });
  });

  describe('User ID Generation', () => {
    test('generates unique user ID based on business information', async () => {
      const mockKeccak256 = jest.fn(() => '0xmockedhash');
      const mockToUtf8Bytes = jest.fn(() => new Uint8Array([1, 2, 3]));

      // Mock ethers utils
      jest.doMock('ethers', () => ({
        utils: {
          keccak256: mockKeccak256,
          toUtf8Bytes: mockToUtf8Bytes,
        },
      }));

      render(
        <SelfVerificationStep 
          form={mockForm} 
          onNext={mockOnNext} 
          onPrev={mockOnPrev} 
        />
      );

      await waitFor(() => {
        expect(mockToUtf8Bytes).toHaveBeenCalledWith(
          expect.stringContaining('Test Business-sole_proprietorship-')
        );
        expect(mockKeccak256).toHaveBeenCalled();
      });
    });

    test('includes timestamp in user ID for uniqueness', async () => {
      const mockKeccak256 = jest.fn(() => '0xmockedhash');
      const mockToUtf8Bytes = jest.fn(() => new Uint8Array([1, 2, 3]));

      jest.doMock('ethers', () => ({
        utils: {
          keccak256: mockKeccak256,
          toUtf8Bytes: mockToUtf8Bytes,
        },
      }));

      render(
        <SelfVerificationStep 
          form={mockForm} 
          onNext={mockOnNext} 
          onPrev={mockOnPrev} 
        />
      );

      await waitFor(() => {
        expect(mockToUtf8Bytes).toHaveBeenCalledWith(
          expect.stringMatching(/Test Business-sole_proprietorship-\d+/)
        );
      });
    });
  });

  describe('Verification Flow', () => {
    test('completes verification flow from initiation to completion', async () => {
      render(
        <SelfVerificationStep 
          form={mockForm} 
          onNext={mockOnNext} 
          onPrev={mockOnPrev} 
        />
      );

      // Wait for verification to complete
      await waitFor(() => {
        expect(screen.getByText('Identity Verified Successfully')).toBeInTheDocument();
      });

      // Verify form value was set
      expect(mockForm.setValue).toHaveBeenCalledWith('verificationResult', {
        verified: true,
        payload: {
          attestations: {
            'self_id.age_over_18': { value: true },
            'self_id.nationality': { value: 'US' },
          },
        },
      });

      // Verify onNext was called
      expect(mockOnNext).toHaveBeenCalled();
    });

    test('handles verification errors gracefully', async () => {
      // Mock QR wrapper to call onError
      const { SelfQRcodeWrapper } = require('@selfxyz/qrcode');
      SelfQRcodeWrapper.mockImplementation(({ onError }) => {
        setTimeout(() => {
          if (onError) {
            onError(new Error('Verification failed'));
          }
        }, 200);
        return <div data-testid="qr-wrapper">QR Wrapper Component</div>;
      });

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

    test('shows verification requirements', () => {
      render(
        <SelfVerificationStep 
          form={mockForm} 
          onNext={mockOnNext} 
          onPrev={mockOnPrev} 
        />
      );

      expect(screen.getByText('Must be 18 years or older')).toBeInTheDocument();
      expect(screen.getByText('Valid passport or government-issued ID')).toBeInTheDocument();
      expect(screen.getByText('Not on any sanctions lists')).toBeInTheDocument();
      expect(screen.getByText('From an eligible country')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('handles verification errors with user feedback', async () => {
      // Mock QR wrapper to call onError
      const { SelfQRcodeWrapper } = require('@selfxyz/qrcode');
      SelfQRcodeWrapper.mockImplementation(({ onError }) => {
        setTimeout(() => {
          if (onError) {
            onError(new Error('Verification failed'));
          }
        }, 200);
        return <div data-testid="qr-wrapper">QR Wrapper Component</div>;
      });

      render(
        <SelfVerificationStep 
          form={mockForm} 
          onNext={mockOnNext} 
          onPrev={mockOnPrev} 
        />
      );

      // Should not show success message
      await waitFor(() => {
        expect(screen.queryByText('Identity Verified Successfully')).not.toBeInTheDocument();
      });

      // Should not call onNext
      expect(mockOnNext).not.toHaveBeenCalled();
    });

    test('handles app initialization errors', async () => {
      (SelfAppBuilder as jest.Mock).mockImplementation(() => {
        throw new Error('App initialization failed');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(
        <SelfVerificationStep 
          form={mockForm} 
          onNext={mockOnNext} 
          onPrev={mockOnPrev} 
        />
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to initialize Self app:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Success Callback', () => {
    test('triggers proper callback and state update on successful verification', async () => {
      render(
        <SelfVerificationStep 
          form={mockForm} 
          onNext={mockOnNext} 
          onPrev={mockOnPrev} 
        />
      );

      // Wait for verification to complete
      await waitFor(() => {
        expect(screen.getByText('Identity Verified Successfully')).toBeInTheDocument();
      });

      // Verify form value was set with correct data
      expect(mockForm.setValue).toHaveBeenCalledWith('verificationResult', {
        verified: true,
        payload: {
          attestations: {
            'self_id.age_over_18': { value: true },
            'self_id.nationality': { value: 'US' },
          },
        },
      });

      // Verify onNext was called
      expect(mockOnNext).toHaveBeenCalled();
    });

    test('enables next button after successful verification', async () => {
      render(
        <SelfVerificationStep 
          form={mockForm} 
          onNext={mockOnNext} 
          onPrev={mockOnPrev} 
        />
      );

      // Initially next button should be disabled
      const nextButton = screen.getByText('Next');
      expect(nextButton).toBeDisabled();

      // Wait for verification to complete
      await waitFor(() => {
        expect(screen.getByText('Identity Verified Successfully')).toBeInTheDocument();
      });

      // Next button should be enabled
      expect(nextButton).not.toBeDisabled();
    });
  });

  describe('Country Support', () => {
    test('only shows Self Protocol supported countries', () => {
      // This test would be implemented in the CountrySelection component
      // For now, we'll test that the excluded countries are properly set
      render(
        <SelfVerificationStep 
          form={mockForm} 
          onNext={mockOnNext} 
          onPrev={mockOnPrev} 
        />
      );

      // Verify that excluded countries are set in disclosures
      expect(SelfAppBuilder).toHaveBeenCalledWith(
        expect.objectContaining({
          disclosures: expect.objectContaining({
            excludedCountries: ['IRN', 'PRK', 'RUS', 'SYR'],
          }),
        })
      );
    });
  });
});
