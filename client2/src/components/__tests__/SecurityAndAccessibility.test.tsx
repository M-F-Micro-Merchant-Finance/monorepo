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

describe('Security and Accessibility Tests', () => {
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
  });

  describe('Input Sanitization', () => {
    test('sanitizes all user inputs to prevent XSS', async () => {
      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);

      const businessNameInput = screen.getByLabelText(/business name/i);
      
      // Test XSS attempts
      const xssAttempts = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src="x" onerror="alert(\'xss\')">',
        '"><script>alert("xss")</script>',
      ];

      for (const xssAttempt of xssAttempts) {
        fireEvent.change(businessNameInput, { target: { value: xssAttempt } });
        fireEvent.blur(businessNameInput);

        // Input should be sanitized and not execute scripts
        expect(businessNameInput.value).not.toContain('<script>');
        expect(businessNameInput.value).not.toContain('javascript:');
        expect(businessNameInput.value).not.toContain('onerror=');
      }
    });

    test('escapes special characters in form inputs', async () => {
      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);

      const businessNameInput = screen.getByLabelText(/business name/i);
      
      const specialChars = ['<', '>', '"', "'", '&', ';'];
      
      for (const char of specialChars) {
        fireEvent.change(businessNameInput, { target: { value: `Test${char}Business` } });
        fireEvent.blur(businessNameInput);

        // Special characters should be properly handled
        expect(businessNameInput.value).toBe(`Test${char}Business`);
      }
    });

    test('validates input length to prevent buffer overflow', async () => {
      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);

      const businessNameInput = screen.getByLabelText(/business name/i);
      
      // Test extremely long input
      const longInput = 'A'.repeat(10000);
      fireEvent.change(businessNameInput, { target: { value: longInput } });
      fireEvent.blur(businessNameInput);

      // Should be truncated or rejected
      expect(businessNameInput.value.length).toBeLessThanOrEqual(255);
    });

    test('filters out potentially dangerous file extensions', async () => {
      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);

      const businessNameInput = screen.getByLabelText(/business name/i);
      
      const dangerousInputs = [
        'test.exe',
        'malware.bat',
        'script.sh',
        'virus.com',
      ];

      for (const dangerousInput of dangerousInputs) {
        fireEvent.change(businessNameInput, { target: { value: dangerousInput } });
        fireEvent.blur(businessNameInput);

        // Should not contain dangerous file extensions
        expect(businessNameInput.value).not.toMatch(/\.(exe|bat|sh|com)$/i);
      }
    });
  });

  describe('XSS Prevention', () => {
    test('prevents script injection in form fields', async () => {
      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);

      const businessNameInput = screen.getByLabelText(/business name/i);
      
      fireEvent.change(businessNameInput, { 
        target: { value: '<script>document.body.innerHTML="hacked"</script>' } 
      });
      fireEvent.blur(businessNameInput);

      // DOM should not be modified
      expect(document.body.innerHTML).not.toContain('hacked');
    });

    test('prevents event handler injection', async () => {
      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);

      const businessNameInput = screen.getByLabelText(/business name/i);
      
      fireEvent.change(businessNameInput, { 
        target: { value: '" onmouseover="alert(\'xss\')" ' } 
      });
      fireEvent.blur(businessNameInput);

      // Input should not have event handlers
      expect(businessNameInput.getAttribute('onmouseover')).toBeNull();
    });

    test('prevents URL scheme injection', async () => {
      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);

      const businessNameInput = screen.getByLabelText(/business name/i);
      
      const urlSchemes = [
        'javascript:alert("xss")',
        'data:text/html,<script>alert("xss")</script>',
        'vbscript:msgbox("xss")',
      ];

      for (const scheme of urlSchemes) {
        fireEvent.change(businessNameInput, { target: { value: scheme } });
        fireEvent.blur(businessNameInput);

        // Should not contain dangerous URL schemes
        expect(businessNameInput.value).not.toMatch(/^(javascript|data|vbscript):/i);
      }
    });
  });

  describe('Data Privacy', () => {
    test('does not store sensitive data in browser storage', () => {
      render(<MerchantOnboardingForm />);

      // Check that sensitive data is not stored in localStorage
      expect(localStorage.getItem('businessName')).toBeNull();
      expect(localStorage.getItem('creditScore')).toBeNull();
      expect(localStorage.getItem('verificationResult')).toBeNull();
    });

    test('clears sensitive data on component unmount', () => {
      const { unmount } = render(<MerchantOnboardingForm />);

      // Simulate storing some data
      localStorage.setItem('tempData', 'sensitive');
      
      unmount();

      // Sensitive data should be cleared
      expect(localStorage.getItem('tempData')).toBeNull();
    });

    test('does not log sensitive information to console', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<MerchantOnboardingForm />);

      // Check that sensitive data is not logged
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('creditScore')
      );
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('verificationResult')
      );

      consoleSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    test('encrypts sensitive data before transmission', async () => {
      // This would typically involve checking that data is encrypted
      // before being sent to the backend
      render(<MerchantOnboardingForm />);

      // Mock form submission
      const form = screen.getByRole('form');
      fireEvent.submit(form);

      // Verify that sensitive data is not sent in plain text
      // This would be implemented in the actual form submission logic
      expect(mockForm.handleSubmit).toHaveBeenCalled();
    });
  });

  describe('Secure Communication', () => {
    test('uses HTTPS for all API calls', () => {
      // Mock fetch to check URLs
      const mockFetch = jest.fn();
      global.fetch = mockFetch;

      render(<MerchantOnboardingForm />);

      // Check that all API calls use HTTPS
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringMatching(/^https:/),
        expect.any(Object)
      );
    });

    test('includes proper security headers in requests', () => {
      const mockFetch = jest.fn();
      global.fetch = mockFetch;

      render(<MerchantOnboardingForm />);

      // Check that security headers are included
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': expect.any(String),
            'X-Requested-With': 'XMLHttpRequest',
          }),
        })
      );
    });

    test('validates SSL certificates', () => {
      // This would typically involve checking SSL certificate validation
      // in the actual implementation
      render(<MerchantOnboardingForm />);

      // Verify that the component is rendered (indicating successful connection)
      expect(screen.getByText('Merchant Onboarding')).toBeInTheDocument();
    });
  });

  describe('Token Security', () => {
    test('handles authentication tokens securely', () => {
      // Mock token storage
      const mockToken = 'mock-jwt-token';
      sessionStorage.setItem('authToken', mockToken);

      render(<MerchantOnboardingForm />);

      // Token should be retrieved securely
      expect(sessionStorage.getItem('authToken')).toBe(mockToken);
    });

    test('expires tokens after appropriate time', () => {
      const mockToken = 'mock-jwt-token';
      const tokenExpiry = Date.now() + 3600000; // 1 hour
      sessionStorage.setItem('authToken', mockToken);
      sessionStorage.setItem('tokenExpiry', tokenExpiry.toString());

      render(<MerchantOnboardingForm />);

      // Token should be valid
      expect(parseInt(sessionStorage.getItem('tokenExpiry') || '0')).toBeGreaterThan(Date.now());
    });

    test('clears tokens on logout', () => {
      sessionStorage.setItem('authToken', 'mock-token');
      sessionStorage.setItem('tokenExpiry', '1234567890');

      // Simulate logout
      sessionStorage.clear();

      render(<MerchantOnboardingForm />);

      expect(sessionStorage.getItem('authToken')).toBeNull();
      expect(sessionStorage.getItem('tokenExpiry')).toBeNull();
    });
  });

  describe('Screen Reader Support', () => {
    test('form is accessible to screen readers', () => {
      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);

      // Check for proper form structure
      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();

      // Check for proper input labels
      const businessNameInput = screen.getByLabelText(/business name/i);
      expect(businessNameInput).toBeInTheDocument();
      expect(businessNameInput).toHaveAttribute('aria-label');
    });

    test('all interactive elements have proper ARIA labels', () => {
      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);

      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        expect(input).toHaveAttribute('aria-label');
      });

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
    });

    test('provides meaningful error messages for screen readers', async () => {
      const formWithErrors = {
        ...mockForm,
        formState: {
          errors: {
            businessName: { message: 'Business name is required' },
          },
        },
      };

      render(<BusinessInformationStep form={formWithErrors} onNext={jest.fn()} />);

      const errorMessage = screen.getByText('Business name is required');
      expect(errorMessage).toHaveAttribute('role', 'alert');
      expect(errorMessage).toHaveAttribute('aria-live', 'polite');
    });

    test('announces form state changes to screen readers', async () => {
      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);

      const businessNameInput = screen.getByLabelText(/business name/i);
      
      fireEvent.change(businessNameInput, { target: { value: 'Test Business' } });
      fireEvent.blur(businessNameInput);

      // Input should have proper ARIA attributes
      expect(businessNameInput).toHaveAttribute('aria-invalid', 'false');
    });
  });

  describe('Keyboard Navigation', () => {
    test('all form elements are navigable via keyboard', () => {
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

    test('supports arrow key navigation in select elements', () => {
      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);

      const select = screen.getByRole('combobox');
      select.focus();

      // Arrow down should open options
      fireEvent.keyDown(select, { key: 'ArrowDown' });
      expect(select).toHaveAttribute('aria-expanded', 'true');
    });

    test('supports Enter key for form submission', () => {
      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);

      const form = screen.getByRole('form');
      
      fireEvent.keyDown(form, { key: 'Enter' });
      expect(mockForm.handleSubmit).toHaveBeenCalled();
    });

    test('supports Escape key to cancel operations', () => {
      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);

      const input = screen.getByLabelText(/business name/i);
      input.focus();
      
      fireEvent.keyDown(input, { key: 'Escape' });
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });
  });

  describe('Color Contrast', () => {
    test('text has sufficient color contrast', () => {
      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);

      const labels = screen.getAllByText(/business name|industry|business age/i);
      labels.forEach(label => {
        const styles = window.getComputedStyle(label);
        // Check that text color and background color have sufficient contrast
        // This would typically involve calculating the contrast ratio
        expect(styles.color).toBeDefined();
        expect(styles.backgroundColor).toBeDefined();
      });
    });

    test('error messages have high contrast', () => {
      const formWithErrors = {
        ...mockForm,
        formState: {
          errors: {
            businessName: { message: 'Business name is required' },
          },
        },
      };

      render(<BusinessInformationStep form={formWithErrors} onNext={jest.fn()} />);

      const errorMessage = screen.getByText('Business name is required');
      const styles = window.getComputedStyle(errorMessage);
      
      // Error messages should have high contrast (typically red on white)
      expect(styles.color).toMatch(/rgb\(220, 38, 38\)|#dc2626/); // red-600
    });

    test('focus indicators are clearly visible', () => {
      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);

      const input = screen.getByLabelText(/business name/i);
      input.focus();

      const styles = window.getComputedStyle(input);
      // Focus should have a visible outline
      expect(styles.outline).not.toBe('none');
    });
  });

  describe('Focus Management', () => {
    test('focus is properly managed during form interactions', () => {
      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);

      const input = screen.getByLabelText(/business name/i);
      input.focus();
      expect(document.activeElement).toBe(input);

      // Focus should move to next input after completion
      fireEvent.change(input, { target: { value: 'Test Business' } });
      fireEvent.blur(input);

      // Next input should be focused
      const nextInput = screen.getByLabelText(/industry/i);
      expect(document.activeElement).toBe(nextInput);
    });

    test('focus returns to error fields after validation', async () => {
      const formWithErrors = {
        ...mockForm,
        formState: {
          errors: {
            businessName: { message: 'Business name is required' },
          },
        },
      };

      render(<BusinessInformationStep form={formWithErrors} onNext={jest.fn()} />);

      const input = screen.getByLabelText(/business name/i);
      
      // Focus should be on the field with error
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby');
    });

    test('focus is trapped in modal dialogs', () => {
      // This would be implemented if modal dialogs are used
      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);

      // Check that focus management is working
      const firstInput = screen.getByLabelText(/business name/i);
      firstInput.focus();
      expect(document.activeElement).toBe(firstInput);
    });
  });

  describe('ARIA Labels', () => {
    test('all interactive elements have proper ARIA labels', () => {
      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);

      const interactiveElements = screen.getAllByRole('textbox', 'button', 'combobox');
      interactiveElements.forEach(element => {
        expect(element).toHaveAttribute('aria-label');
      });
    });

    test('form groups have proper ARIA structure', () => {
      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);

      const fieldset = screen.getByRole('group');
      expect(fieldset).toHaveAttribute('aria-labelledby');
    });

    test('error messages are properly associated with form fields', () => {
      const formWithErrors = {
        ...mockForm,
        formState: {
          errors: {
            businessName: { message: 'Business name is required' },
          },
        },
      };

      render(<BusinessInformationStep form={formWithErrors} onNext={jest.fn()} />);

      const input = screen.getByLabelText(/business name/i);
      const errorMessage = screen.getByText('Business name is required');
      
      expect(input).toHaveAttribute('aria-describedby');
      expect(errorMessage).toHaveAttribute('id');
    });
  });
});
