import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../test/test-utils';
import { CountrySelection } from '../CountrySelection';

// Mock react-select
jest.mock('react-select', () => {
  const MockSelect = ({ value, onChange, options, placeholder, isSearchable }: any) => (
    <div data-testid="country-select">
      <select
        value={value}
        onChange={(e) => onChange(options.find((opt: any) => opt.value === e.target.value))}
        data-testid="select-element"
      >
        <option value="">{placeholder}</option>
        {options.map((option: any) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
  return MockSelect;
});

describe('CountrySelection', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default label', () => {
    render(
      <CountrySelection
        value=""
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Country')).toBeInTheDocument();
  });

  it('renders with custom label', () => {
    render(
      <CountrySelection
        value=""
        onChange={mockOnChange}
        label="Select Country"
      />
    );

    expect(screen.getByText('Select Country')).toBeInTheDocument();
  });

  it('shows required asterisk when required', () => {
    render(
      <CountrySelection
        value=""
        onChange={mockOnChange}
        required
      />
    );

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('displays error message when provided', () => {
    render(
      <CountrySelection
        value=""
        onChange={mockOnChange}
        error="Please select a country"
      />
    );

    expect(screen.getByText('Please select a country')).toBeInTheDocument();
  });

  it('calls onChange when selection is made', async () => {
    render(
      <CountrySelection
        value=""
        onChange={mockOnChange}
      />
    );

    const select = screen.getByTestId('select-element');
    fireEvent.change(select, { target: { value: 'US' } });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('US');
    });
  });

  it('shows placeholder text', () => {
    render(
      <CountrySelection
        value=""
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Select a country...')).toBeInTheDocument();
  });

  it('displays selected value', () => {
    render(
      <CountrySelection
        value="US"
        onChange={mockOnChange}
      />
    );

    const select = screen.getByTestId('select-element');
    expect(select).toHaveValue('US');
  });

  it('includes Self Protocol supported countries', () => {
    render(
      <CountrySelection
        value=""
        onChange={mockOnChange}
      />
    );

    // Check for some key countries
    expect(screen.getByText('United States')).toBeInTheDocument();
    expect(screen.getByText('Canada')).toBeInTheDocument();
    expect(screen.getByText('United Kingdom')).toBeInTheDocument();
    expect(screen.getByText('Germany')).toBeInTheDocument();
    expect(screen.getByText('Kenya')).toBeInTheDocument();
    expect(screen.getByText('Nigeria')).toBeInTheDocument();
  });

  it('handles empty selection', async () => {
    render(
      <CountrySelection
        value=""
        onChange={mockOnChange}
      />
    );

    const select = screen.getByTestId('select-element');
    fireEvent.change(select, { target: { value: '' } });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('');
    });
  });
});
