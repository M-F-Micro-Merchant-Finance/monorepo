import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MerchantOnboardingForm } from '../MerchantOnboardingForm';
import { BusinessInformationStep } from '../steps/BusinessInformationStep';
import { SelfVerificationStep } from '../steps/SelfVerificationStep';

// Mock useMediaQuery hook
const mockUseMediaQuery = jest.fn();
jest.mock('@/hooks/useMediaQuery', () => ({
  useMediaQuery: mockUseMediaQuery,
}));

// Mock Self Protocol modules
jest.mock('@selfxyz/core', () => ({
  SelfAppBuilder: jest.fn(() => ({
    build: jest.fn().mockReturnValue({
      version: 2,
      appName: 'Merchant CDS Onboarding',
      scope: 'merchant-cds-verification',
      endpoint: 'https://api.self.xyz/verify',
      userId: 'mock-user-id',
    }),
  })),
  getUniversalLink: jest.fn(() => 'https://self.xyz/verify?token=mock-token'),
}));

jest.mock('@selfxyz/qrcode', () => ({
  QRCode: jest.fn(() => <div data-testid="qr-code">QR Code Component</div>),
  SelfQRcodeWrapper: jest.fn(() => <div data-testid="qr-wrapper">QR Wrapper Component</div>),
}));

// Mock window.open for mobile testing
const mockOpen = jest.fn();
Object.defineProperty(window, 'open', {
  value: mockOpen,
  writable: true,
});

describe('Mobile Optimization Tests', () => {
  const mockForm = {
    register: jest.fn(),
    handleSubmit: jest.fn(),
    formState: { errors: {} },
    getValues: jest.fn(),
    setValue: jest.fn(),
    watch: jest.fn(),
    control: {},
    trigger: jest.fn(),
    clearErrors: jest.fn(),
    setError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockOpen.mockClear();
  });

  describe('Responsive Design', () => {
    test('form is fully responsive across all device sizes', async () => {
      // Test mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      mockUseMediaQuery.mockReturnValue(false);

      const { rerender } = render(<MerchantOnboardingForm />);

      // Mobile should show mobile-optimized layout
      expect(screen.getByText('Merchant Onboarding')).toBeInTheDocument();

      // Test tablet viewport
      Object.defineProperty(window, 'innerWidth', { value: 768, writable: true });
      mockUseMediaQuery.mockReturnValue(true);
      rerender(<MerchantOnboardingForm />);

      // Tablet should show responsive layout
      expect(screen.getByText('Merchant Onboarding')).toBeInTheDocument();

      // Test desktop viewport
      Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
      mockUseMediaQuery.mockReturnValue(true);
      rerender(<MerchantOnboardingForm />);

      // Desktop should show full layout
      expect(screen.getByText('Merchant Onboarding')).toBeInTheDocument();
    });

    test('adapts layout based on screen size', () => {
      // Test mobile layout
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      mockUseMediaQuery.mockReturnValue(false);

      render(<MerchantOnboardingForm />);

      // Mobile should have mobile-specific classes
      const container = screen.getByText('Merchant Onboarding').closest('div');
      expect(container).toHaveClass('min-h-screen', 'bg-gray-50');
    });

    test('maintains usability across different orientations', () => {
      // Test portrait orientation
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 667, writable: true });
      mockUseMediaQuery.mockReturnValue(false);

      render(<MerchantOnboardingForm />);

      expect(screen.getByText('Merchant Onboarding')).toBeInTheDocument();

      // Test landscape orientation
      Object.defineProperty(window, 'innerWidth', { value: 667, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 375, writable: true });

      // Re-render to test landscape
      render(<MerchantOnboardingForm />);

      expect(screen.getByText('Merchant Onboarding')).toBeInTheDocument();
    });
  });

  describe('Touch Interface', () => {
    test('all interactive elements are touch-friendly on mobile devices', () => {
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      mockUseMediaQuery.mockReturnValue(false);

      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);

      // Check that buttons have appropriate touch targets
      const nextButton = screen.getByText('Next');
      expect(nextButton).toHaveClass('px-4', 'py-2'); // Minimum 44px touch target

      // Check that form inputs are touch-friendly
      const businessNameInput = screen.getByLabelText(/business name/i);
      expect(businessNameInput).toHaveClass('px-3', 'py-2'); // Adequate padding for touch
    });

    test('buttons have minimum 44px touch target size', () => {
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      mockUseMediaQuery.mockReturnValue(false);

      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);

      const nextButton = screen.getByText('Next');
      const buttonStyles = window.getComputedStyle(nextButton);
      
      // Check minimum dimensions (44px = 2.75rem)
      expect(buttonStyles.minHeight).toBe('2.75rem');
      expect(buttonStyles.minWidth).toBe('2.75rem');
    });

    test('form inputs are easily tappable on mobile', () => {
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      mockUseMediaQuery.mockReturnValue(false);

      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);

      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        const styles = window.getComputedStyle(input);
        expect(parseInt(styles.paddingTop)).toBeGreaterThanOrEqual(12); // 12px minimum padding
        expect(parseInt(styles.paddingBottom)).toBeGreaterThanOrEqual(12);
      });
    });
  });

  describe('Mobile Navigation', () => {
    test('step navigation works smoothly on mobile', async () => {
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      mockUseMediaQuery.mockReturnValue(false);

      const mockOnNext = jest.fn();
      render(<BusinessInformationStep form={mockForm} onNext={mockOnNext} />);

      // Fill required fields
      fireEvent.change(screen.getByLabelText(/business name/i), { 
        target: { value: 'Test Business' } 
      });
      fireEvent.change(screen.getByLabelText(/business type/i), { 
        target: { value: 'sole_proprietorship' } 
      });
      fireEvent.change(screen.getByLabelText(/industry/i), { 
        target: { value: 'Technology' } 
      });
      fireEvent.change(screen.getByLabelText(/business age/i), { 
        target: { value: '5' } 
      });

      // Navigate to next step
      fireEvent.click(screen.getByText('Next'));

      expect(mockOnNext).toHaveBeenCalled();
    });

    test('progress indicator is visible and functional on mobile', () => {
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      mockUseMediaQuery.mockReturnValue(false);

      render(<MerchantOnboardingForm />);

      // Check that progress indicator is visible
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
    });

    test('navigation buttons are properly sized for mobile', () => {
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      mockUseMediaQuery.mockReturnValue(false);

      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);

      const nextButton = screen.getByText('Next');
      const buttonRect = nextButton.getBoundingClientRect();
      
      // Check minimum touch target size
      expect(buttonRect.height).toBeGreaterThanOrEqual(44);
      expect(buttonRect.width).toBeGreaterThanOrEqual(44);
    });
  });

  describe('Mobile Performance', () => {
    test('form loads quickly on mobile devices', async () => {
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      mockUseMediaQuery.mockReturnValue(false);

      const startTime = performance.now();
      render(<MerchantOnboardingForm />);
      const endTime = performance.now();

      // Form should load within 100ms
      expect(endTime - startTime).toBeLessThan(100);
    });

    test('form responds quickly to user interactions on mobile', async () => {
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      mockUseMediaQuery.mockReturnValue(false);

      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);

      const input = screen.getByLabelText(/business name/i);
      
      const startTime = performance.now();
      fireEvent.change(input, { target: { value: 'Test Business' } });
      const endTime = performance.now();

      // Input should respond within 16ms (60fps)
      expect(endTime - startTime).toBeLessThan(16);
    });

    test('does not cause memory leaks during extended use', () => {
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      mockUseMediaQuery.mockReturnValue(false);

      const initialMemory = performance.memory?.usedJSHeapSize || 0;

      // Simulate multiple renders
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(<MerchantOnboardingForm />);
        unmount();
      }

      // Force garbage collection if available
      if (window.gc) {
        window.gc();
      }

      const finalMemory = performance.memory?.usedJSHeapSize || 0;
      
      // Memory usage should not increase significantly
      expect(finalMemory - initialMemory).toBeLessThan(1000000); // 1MB threshold
    });
  });

  describe('Mobile Deep Linking', () => {
    test('mobile deep links open Self app correctly', async () => {
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      mockUseMediaQuery.mockReturnValue(false);

      render(<SelfVerificationStep form={mockForm} onNext={jest.fn()} onPrev={jest.fn()} />);

      // Wait for deep link button to appear
      await waitFor(() => {
        expect(screen.getByText('Open Self App')).toBeInTheDocument();
      });

      // Click the deep link button
      fireEvent.click(screen.getByText('Open Self App'));

      expect(mockOpen).toHaveBeenCalledWith('https://self.xyz/verify?token=mock-token', '_blank');
    });

    test('shows deep link button instead of QR code on mobile', async () => {
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      mockUseMediaQuery.mockReturnValue(false);

      render(<SelfVerificationStep form={mockForm} onNext={jest.fn()} onPrev={jest.fn()} />);

      await waitFor(() => {
        expect(screen.getByText('Open Self App')).toBeInTheDocument();
        expect(screen.queryByTestId('qr-wrapper')).not.toBeInTheDocument();
      });
    });

    test('handles deep link errors gracefully', async () => {
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      mockUseMediaQuery.mockReturnValue(false);

      // Mock window.open to throw an error
      mockOpen.mockImplementation(() => {
        throw new Error('Deep link failed');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<SelfVerificationStep form={mockForm} onNext={jest.fn()} onPrev={jest.fn()} />);

      await waitFor(() => {
        expect(screen.getByText('Open Self App')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Open Self App'));

      // Should handle error gracefully
      expect(consoleSpy).toHaveBeenCalledWith('Deep link error:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('Mobile Form Validation', () => {
    test('validation works properly on mobile keyboards', async () => {
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      mockUseMediaQuery.mockReturnValue(false);

      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);

      const input = screen.getByLabelText(/business name/i);
      
      // Test mobile keyboard input
      fireEvent.change(input, { target: { value: 'A' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText('Business name must be at least 2 characters')).toBeInTheDocument();
      });
    });

    test('form validation triggers on mobile input events', async () => {
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      mockUseMediaQuery.mockReturnValue(false);

      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);

      const input = screen.getByLabelText(/business name/i);
      
      // Test input event
      fireEvent.input(input, { target: { value: 'Test' } });
      
      // Should trigger validation
      expect(mockForm.trigger).toHaveBeenCalled();
    });
  });

  describe('Mobile Error Display', () => {
    test('error messages are clearly visible on mobile screens', async () => {
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      mockUseMediaQuery.mockReturnValue(false);

      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);

      const input = screen.getByLabelText(/business name/i);
      fireEvent.change(input, { target: { value: 'A' } });
      fireEvent.blur(input);

      await waitFor(() => {
        const errorMessage = screen.getByText('Business name must be at least 2 characters');
        expect(errorMessage).toBeInTheDocument();
        
        // Check error message styling
        expect(errorMessage).toHaveClass('text-red-600', 'text-sm');
      });
    });

    test('error messages are positioned appropriately for mobile', async () => {
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      mockUseMediaQuery.mockReturnValue(false);

      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);

      const input = screen.getByLabelText(/business name/i);
      fireEvent.change(input, { target: { value: 'A' } });
      fireEvent.blur(input);

      await waitFor(() => {
        const errorMessage = screen.getByText('Business name must be at least 2 characters');
        const inputRect = input.getBoundingClientRect();
        const errorRect = errorMessage.getBoundingClientRect();
        
        // Error message should be positioned below the input
        expect(errorRect.top).toBeGreaterThan(inputRect.bottom);
      });
    });

    test('multiple error messages are properly spaced on mobile', async () => {
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      mockUseMediaQuery.mockReturnValue(false);

      // Mock form to have multiple errors
      const formWithErrors = {
        ...mockForm,
        formState: {
          errors: {
            businessName: { message: 'Business name is required' },
            industry: { message: 'Industry is required' },
            businessAge: { message: 'Business age is required' },
          },
        },
      };

      render(<BusinessInformationStep form={formWithErrors} onNext={jest.fn()} />);

      // All error messages should be visible
      expect(screen.getByText('Business name is required')).toBeInTheDocument();
      expect(screen.getByText('Industry is required')).toBeInTheDocument();
      expect(screen.getByText('Business age is required')).toBeInTheDocument();
    });
  });

  describe('Mobile Accessibility', () => {
    test('form is accessible on mobile screen readers', () => {
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      mockUseMediaQuery.mockReturnValue(false);

      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);

      // Check for proper ARIA labels
      const businessNameInput = screen.getByLabelText(/business name/i);
      expect(businessNameInput).toHaveAttribute('aria-label');

      // Check for proper form structure
      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();
    });

    test('keyboard navigation works on mobile', () => {
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      mockUseMediaQuery.mockReturnValue(false);

      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);

      const inputs = screen.getAllByRole('textbox');
      const firstInput = inputs[0];
      
      // Focus first input
      firstInput.focus();
      expect(document.activeElement).toBe(firstInput);

      // Tab to next input
      fireEvent.keyDown(firstInput, { key: 'Tab' });
      expect(document.activeElement).toBe(inputs[1]);
    });
  });
});
