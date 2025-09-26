import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MerchantOnboardingForm } from '../MerchantOnboardingForm';
import { BusinessInformationStep } from '../steps/BusinessInformationStep';
import { FinancialInformationStep } from '../steps/FinancialInformationStep';
import { CountrySelection } from '../CountrySelection';

// Mock the form hook
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

describe('Form Validation Tests', () => {
  describe('Business Information Validation', () => {
    test('validates required business fields', async () => {
      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);
      
      // Try to submit without filling required fields
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);
      
      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText('Business name must be at least 2 characters')).toBeInTheDocument();
      });
    });

    test('validates business name length', async () => {
      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);
      
      const businessNameInput = screen.getByLabelText(/business name/i);
      
      // Test minimum length
      fireEvent.change(businessNameInput, { target: { value: 'A' } });
      fireEvent.blur(businessNameInput);
      
      await waitFor(() => {
        expect(screen.getByText('Business name must be at least 2 characters')).toBeInTheDocument();
      });
      
      // Test valid length
      fireEvent.change(businessNameInput, { target: { value: 'Valid Business Name' } });
      fireEvent.blur(businessNameInput);
      
      await waitFor(() => {
        expect(screen.queryByText('Business name must be at least 2 characters')).not.toBeInTheDocument();
      });
    });

    test('validates business type selection', async () => {
      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);
      
      const businessTypeSelect = screen.getByLabelText(/business type/i);
      
      // Test invalid selection
      fireEvent.change(businessTypeSelect, { target: { value: 'invalid_type' } });
      fireEvent.blur(businessTypeSelect);
      
      await waitFor(() => {
        expect(screen.getByText('Please select a valid business type')).toBeInTheDocument();
      });
      
      // Test valid selection
      fireEvent.change(businessTypeSelect, { target: { value: 'sole_proprietorship' } });
      fireEvent.blur(businessTypeSelect);
      
      await waitFor(() => {
        expect(screen.queryByText('Please select a valid business type')).not.toBeInTheDocument();
      });
    });

    test('validates industry field', async () => {
      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);
      
      const industryInput = screen.getByLabelText(/industry/i);
      
      // Test empty industry
      fireEvent.change(industryInput, { target: { value: '' } });
      fireEvent.blur(industryInput);
      
      await waitFor(() => {
        expect(screen.getByText('Industry is required')).toBeInTheDocument();
      });
      
      // Test valid industry
      fireEvent.change(industryInput, { target: { value: 'Technology' } });
      fireEvent.blur(industryInput);
      
      await waitFor(() => {
        expect(screen.queryByText('Industry is required')).not.toBeInTheDocument();
      });
    });

    test('validates business age range', async () => {
      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);
      
      const businessAgeInput = screen.getByLabelText(/business age/i);
      
      // Test negative age
      fireEvent.change(businessAgeInput, { target: { value: '-1' } });
      fireEvent.blur(businessAgeInput);
      
      await waitFor(() => {
        expect(screen.getByText('Business age must be between 0 and 100')).toBeInTheDocument();
      });
      
      // Test age over 100
      fireEvent.change(businessAgeInput, { target: { value: '101' } });
      fireEvent.blur(businessAgeInput);
      
      await waitFor(() => {
        expect(screen.getByText('Business age must be between 0 and 100')).toBeInTheDocument();
      });
      
      // Test valid age
      fireEvent.change(businessAgeInput, { target: { value: '5' } });
      fireEvent.blur(businessAgeInput);
      
      await waitFor(() => {
        expect(screen.queryByText('Business age must be between 0 and 100')).not.toBeInTheDocument();
      });
    });
  });

  describe('Financial Data Validation', () => {
    test('validates numeric fields accept only valid numbers', async () => {
      render(<FinancialInformationStep form={mockForm} onNext={jest.fn()} onPrev={jest.fn()} />);
      
      const revenueInput = screen.getByLabelText(/current monthly revenue/i);
      
      // Test non-numeric input
      fireEvent.change(revenueInput, { target: { value: 'abc' } });
      fireEvent.blur(revenueInput);
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid number')).toBeInTheDocument();
      });
      
      // Test valid number
      fireEvent.change(revenueInput, { target: { value: '5000' } });
      fireEvent.blur(revenueInput);
      
      await waitFor(() => {
        expect(screen.queryByText('Please enter a valid number')).not.toBeInTheDocument();
      });
    });

    test('validates revenue growth rate range', async () => {
      render(<FinancialInformationStep form={mockForm} onNext={jest.fn()} onPrev={jest.fn()} />);
      
      const growthRateInput = screen.getByLabelText(/revenue growth rate/i);
      
      // Test growth rate below -100
      fireEvent.change(growthRateInput, { target: { value: '-101' } });
      fireEvent.blur(growthRateInput);
      
      await waitFor(() => {
        expect(screen.getByText('Growth rate must be between -100% and 1000%')).toBeInTheDocument();
      });
      
      // Test growth rate above 1000
      fireEvent.change(growthRateInput, { target: { value: '1001' } });
      fireEvent.blur(growthRateInput);
      
      await waitFor(() => {
        expect(screen.getByText('Growth rate must be between -100% and 1000%')).toBeInTheDocument();
      });
      
      // Test valid growth rate
      fireEvent.change(growthRateInput, { target: { value: '15' } });
      fireEvent.blur(growthRateInput);
      
      await waitFor(() => {
        expect(screen.queryByText('Growth rate must be between -100% and 1000%')).not.toBeInTheDocument();
      });
    });

    test('validates expense fields are non-negative', async () => {
      render(<FinancialInformationStep form={mockForm} onNext={jest.fn()} onPrev={jest.fn()} />);
      
      const fixedExpensesInput = screen.getByLabelText(/fixed expenses/i);
      
      // Test negative expenses
      fireEvent.change(fixedExpensesInput, { target: { value: '-100' } });
      fireEvent.blur(fixedExpensesInput);
      
      await waitFor(() => {
        expect(screen.getByText('Expenses must be non-negative')).toBeInTheDocument();
      });
      
      // Test valid expenses
      fireEvent.change(fixedExpensesInput, { target: { value: '2000' } });
      fireEvent.blur(fixedExpensesInput);
      
      await waitFor(() => {
        expect(screen.queryByText('Expenses must be non-negative')).not.toBeInTheDocument();
      });
    });
  });

  describe('Country Code Validation', () => {
    test('validates country selection accepts only valid 2-character ISO codes', async () => {
      render(<CountrySelection value="" onChange={jest.fn()} />);
      
      const countrySelect = screen.getByRole('combobox');
      
      // Test invalid country code
      fireEvent.change(countrySelect, { target: { value: 'INVALID' } });
      fireEvent.blur(countrySelect);
      
      await waitFor(() => {
        expect(screen.getByText('Please select a valid country')).toBeInTheDocument();
      });
      
      // Test valid country code
      fireEvent.change(countrySelect, { target: { value: 'US' } });
      fireEvent.blur(countrySelect);
      
      await waitFor(() => {
        expect(screen.queryByText('Please select a valid country')).not.toBeInTheDocument();
      });
    });

    test('validates required country field', async () => {
      render(<CountrySelection value="" onChange={jest.fn()} required />);
      
      const countrySelect = screen.getByRole('combobox');
      
      // Try to submit without selecting country
      fireEvent.blur(countrySelect);
      
      await waitFor(() => {
        expect(screen.getByText('Country is required')).toBeInTheDocument();
      });
    });
  });

  describe('Data Type Validation', () => {
    test('validates string fields accept only strings', async () => {
      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);
      
      const businessNameInput = screen.getByLabelText(/business name/i);
      
      // Test numeric input in string field
      fireEvent.change(businessNameInput, { target: { value: 123 } });
      fireEvent.blur(businessNameInput);
      
      await waitFor(() => {
        expect(screen.getByText('Business name must be a string')).toBeInTheDocument();
      });
    });

    test('validates number fields accept only numbers', async () => {
      render(<FinancialInformationStep form={mockForm} onNext={jest.fn()} onPrev={jest.fn()} />);
      
      const revenueInput = screen.getByLabelText(/current monthly revenue/i);
      
      // Test string input in number field
      fireEvent.change(revenueInput, { target: { value: 'not a number' } });
      fireEvent.blur(revenueInput);
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid number')).toBeInTheDocument();
      });
    });

    test('validates enum fields accept only valid enum values', async () => {
      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);
      
      const businessTypeSelect = screen.getByLabelText(/business type/i);
      
      // Test invalid enum value
      fireEvent.change(businessTypeSelect, { target: { value: 'invalid_enum' } });
      fireEvent.blur(businessTypeSelect);
      
      await waitFor(() => {
        expect(screen.getByText('Please select a valid business type')).toBeInTheDocument();
      });
    });

    test('validates boolean fields accept only boolean values', async () => {
      render(<FinancialInformationStep form={mockForm} onNext={jest.fn()} onPrev={jest.fn()} />);
      
      const collateralCheckbox = screen.getByLabelText(/collateral available/i);
      
      // Test invalid boolean value
      fireEvent.change(collateralCheckbox, { target: { value: 'maybe' } });
      fireEvent.blur(collateralCheckbox);
      
      await waitFor(() => {
        expect(screen.getByText('Please select yes or no')).toBeInTheDocument();
      });
    });
  });

  describe('Range Validation', () => {
    test('validates percentage fields are between 0 and 100', async () => {
      render(<FinancialInformationStep form={mockForm} onNext={jest.fn()} onPrev={jest.fn()} />);
      
      const percentageInput = screen.getByLabelText(/percentage of revenue/i);
      
      // Test percentage below 0
      fireEvent.change(percentageInput, { target: { value: '-1' } });
      fireEvent.blur(percentageInput);
      
      await waitFor(() => {
        expect(screen.getByText('Percentage must be between 0 and 100')).toBeInTheDocument();
      });
      
      // Test percentage above 100
      fireEvent.change(percentageInput, { target: { value: '101' } });
      fireEvent.blur(percentageInput);
      
      await waitFor(() => {
        expect(screen.getByText('Percentage must be between 0 and 100')).toBeInTheDocument();
      });
      
      // Test valid percentage
      fireEvent.change(percentageInput, { target: { value: '50' } });
      fireEvent.blur(percentageInput);
      
      await waitFor(() => {
        expect(screen.queryByText('Percentage must be between 0 and 100')).not.toBeInTheDocument();
      });
    });
  });

  describe('Format Validation', () => {
    test('validates business name format', async () => {
      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);
      
      const businessNameInput = screen.getByLabelText(/business name/i);
      
      // Test business name with special characters
      fireEvent.change(businessNameInput, { target: { value: 'Business@#$%' } });
      fireEvent.blur(businessNameInput);
      
      await waitFor(() => {
        expect(screen.getByText('Business name contains invalid characters')).toBeInTheDocument();
      });
      
      // Test valid business name
      fireEvent.change(businessNameInput, { target: { value: 'Valid Business Name' } });
      fireEvent.blur(businessNameInput);
      
      await waitFor(() => {
        expect(screen.queryByText('Business name contains invalid characters')).not.toBeInTheDocument();
      });
    });

    test('validates industry code format', async () => {
      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);
      
      const industryInput = screen.getByLabelText(/industry/i);
      
      // Test industry with numbers only
      fireEvent.change(industryInput, { target: { value: '12345' } });
      fireEvent.blur(industryInput);
      
      await waitFor(() => {
        expect(screen.getByText('Industry must contain letters')).toBeInTheDocument();
      });
      
      // Test valid industry
      fireEvent.change(industryInput, { target: { value: 'Technology' } });
      fireEvent.blur(industryInput);
      
      await waitFor(() => {
        expect(screen.queryByText('Industry must contain letters')).not.toBeInTheDocument();
      });
    });
  });

  describe('Required Field Validation', () => {
    test('shows validation errors for all empty required fields', async () => {
      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);
      
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);
      
      await waitFor(() => {
        expect(screen.getByText('Business name must be at least 2 characters')).toBeInTheDocument();
        expect(screen.getByText('Please select a valid business type')).toBeInTheDocument();
        expect(screen.getByText('Industry is required')).toBeInTheDocument();
        expect(screen.getByText('Business age must be between 0 and 100')).toBeInTheDocument();
      });
    });

    test('clears validation errors when fields are filled', async () => {
      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);
      
      // Fill all required fields
      fireEvent.change(screen.getByLabelText(/business name/i), { target: { value: 'Test Business' } });
      fireEvent.change(screen.getByLabelText(/business type/i), { target: { value: 'sole_proprietorship' } });
      fireEvent.change(screen.getByLabelText(/industry/i), { target: { value: 'Technology' } });
      fireEvent.change(screen.getByLabelText(/business age/i), { target: { value: '5' } });
      
      // Try to submit again
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);
      
      await waitFor(() => {
        expect(screen.queryByText('Business name must be at least 2 characters')).not.toBeInTheDocument();
        expect(screen.queryByText('Please select a valid business type')).not.toBeInTheDocument();
        expect(screen.queryByText('Industry is required')).not.toBeInTheDocument();
        expect(screen.queryByText('Business age must be between 0 and 100')).not.toBeInTheDocument();
      });
    });
  });
});
