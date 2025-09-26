import React from 'react';
import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { BusinessInformationStep } from '../steps/BusinessInformationStep';
import { MerchantOnboardingFormData } from '../../types/contracts';

// Mock the form hook
const mockForm = {
  register: jest.fn(),
  formState: { errors: {} },
  watch: jest.fn(),
  setValue: jest.fn(),
  handleSubmit: jest.fn(),
  getValues: jest.fn(),
  setError: jest.fn(),
  clearErrors: jest.fn(),
  trigger: jest.fn(),
  reset: jest.fn(),
  control: {} as any,
  unregister: jest.fn(),
  resetField: jest.fn(),
  setFocus: jest.fn(),
  getFieldState: jest.fn(),
  getValues: jest.fn(),
  formState: { errors: {}, isDirty: false, isSubmitting: false, isValid: true, touchedFields: {}, dirtyFields: {}, isSubmitted: false, submitCount: 0 }
};

describe('BusinessInformationStep', () => {
  it('renders all form fields', () => {
    render(
      <BusinessInformationStep 
        form={mockForm as any} 
        onNext={jest.fn()} 
      />
    );

    // Check if all required fields are present by looking for labels and inputs
    expect(screen.getByText('Business Name *')).toBeInTheDocument();
    expect(screen.getByText('Business Type *')).toBeInTheDocument();
    expect(screen.getByText('Industry *')).toBeInTheDocument();
    expect(screen.getByText('Business Age (in months) *')).toBeInTheDocument();
    expect(screen.getByText('Legal Structure *')).toBeInTheDocument();
    expect(screen.getByText('Registration Status *')).toBeInTheDocument();
    
    // Check for input elements
    expect(screen.getByPlaceholderText('Enter your business name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g., Agriculture, Retail, Manufacturing')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('0')).toBeInTheDocument();
    
    // Check for radio buttons
    expect(screen.getByDisplayValue('formal')).toBeInTheDocument();
    expect(screen.getByDisplayValue('informal')).toBeInTheDocument();
    expect(screen.getByDisplayValue('registered')).toBeInTheDocument();
    expect(screen.getByDisplayValue('unregistered')).toBeInTheDocument();
  });

  it('displays error messages when validation fails', () => {
    const formWithErrors = {
      ...mockForm,
      formState: {
        errors: {
          businessName: { message: 'Business name is required' },
          businessType: { message: 'Business type is required' }
        }
      }
    };

    render(
      <BusinessInformationStep 
        form={formWithErrors as any} 
        onNext={jest.fn()} 
      />
    );

    expect(screen.getByText('Business name is required')).toBeInTheDocument();
    expect(screen.getByText('Business type is required')).toBeInTheDocument();
  });
});
