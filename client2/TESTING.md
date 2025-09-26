# Testing Guide for Merchant CDS Frontend

This guide explains how to test the Merchant CDS Frontend application with comprehensive testing strategies.

## Testing Overview

The application includes three types of tests:
- **Unit Tests**: Individual component and utility function testing
- **Integration Tests**: Testing component interactions and API integrations
- **End-to-End (E2E) Tests**: Complete user workflow testing

## Prerequisites

Before running tests, ensure you have:
- Node.js 18+ installed
- All dependencies installed (`npm install`)
- Environment variables configured

## Running Tests

### Install Dependencies

```bash
npm install
```

### Unit Tests

Run unit tests with Jest:

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test MerchantOnboardingForm.test.tsx
```

### End-to-End Tests

Run E2E tests with Playwright:

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run specific E2E test
npx playwright test merchant-onboarding.spec.ts
```

### All Tests

Run both unit and E2E tests:

```bash
npm run test:all
```

## Test Structure

### Unit Tests

```
src/
├── components/
│   └── __tests__/
│       ├── MerchantOnboardingForm.test.tsx
│       ├── SelfVerificationStep.test.tsx
│       └── CountrySelection.test.tsx
├── utils/
│   └── __tests__/
│       └── contractIntegration.test.ts
└── test/
    ├── setup.ts
    ├── test-utils.tsx
    └── mocks/
        ├── selfProtocol.ts
        ├── ethers.ts
        └── contracts.ts
```

### E2E Tests

```
tests/
└── e2e/
    └── merchant-onboarding.spec.ts
```

## Test Configuration

### Jest Configuration

Jest is configured in `jest.config.js` with:
- Next.js integration
- TypeScript support
- Custom test environment setup
- Coverage thresholds (80% minimum)
- Mock setup for external dependencies

### Playwright Configuration

Playwright is configured in `playwright.config.ts` with:
- Multiple browser support (Chrome, Firefox, Safari)
- Mobile device testing
- Automatic dev server startup
- Trace collection for debugging

## Testing Strategies

### 1. Component Testing

Test individual React components with:
- **Rendering**: Verify components render correctly
- **Props**: Test prop handling and validation
- **User Interactions**: Test button clicks, form inputs, navigation
- **State Changes**: Test component state updates
- **Error Handling**: Test error states and edge cases

Example:
```typescript
it('renders business information step', () => {
  render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);
  expect(screen.getByText('Business Information')).toBeInTheDocument();
});
```

### 2. Integration Testing

Test component interactions and external integrations:
- **Form Flow**: Test multi-step form navigation
- **Self Protocol**: Test identity verification flow
- **Contract Integration**: Test smart contract interactions
- **API Calls**: Test backend communication

Example:
```typescript
it('handles successful verification', async () => {
  render(<SelfVerificationStep form={mockForm} onNext={mockOnNext} />);
  
  await waitFor(() => {
    expect(screen.getByText('Identity Verified Successfully')).toBeInTheDocument();
  });
  
  expect(mockOnNext).toHaveBeenCalled();
});
```

### 3. End-to-End Testing

Test complete user workflows:
- **Full Onboarding**: Complete merchant onboarding process
- **Form Validation**: Test client-side validation
- **Mobile Experience**: Test mobile-specific interactions
- **Error Scenarios**: Test error handling and recovery

Example:
```typescript
test('completes full onboarding flow', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Fill business information
  await page.fill('input[name="businessName"]', 'Test Business');
  // ... fill other fields
  
  // Navigate through steps
  await page.click('button:has-text("Next")');
  
  // Verify final submission
  await expect(page.getByText('Submit Application')).toBeVisible();
});
```

## Mocking Strategy

### External Dependencies

Mock external dependencies to isolate tests:
- **Self Protocol**: Mock QR code generation and verification
- **Ethers.js**: Mock blockchain interactions
- **ContractKit**: Mock Celo contract calls
- **React Select**: Mock dropdown components

### Test Data

Use consistent test data across tests:
- **Mock Form Data**: Standardized form data for testing
- **Mock Verification Results**: Simulated Self Protocol responses
- **Mock Contract Responses**: Simulated blockchain transactions

## Coverage Requirements

The project maintains 80% code coverage across:
- **Branches**: 80% minimum
- **Functions**: 80% minimum
- **Lines**: 80% minimum
- **Statements**: 80% minimum

## Debugging Tests

### Unit Tests

Debug unit tests with:
```bash
# Run specific test with verbose output
npm test -- --verbose MerchantOnboardingForm.test.tsx

# Run tests in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand
```

### E2E Tests

Debug E2E tests with:
```bash
# Run with headed browser
npx playwright test --headed

# Run with debug mode
npx playwright test --debug

# Run specific test with trace
npx playwright test --trace on merchant-onboarding.spec.ts
```

## Continuous Integration

### GitHub Actions

The project includes CI configuration for:
- **Unit Test Execution**: Run on every PR
- **E2E Test Execution**: Run on main branch
- **Coverage Reporting**: Track coverage changes
- **Linting**: Code quality checks

### Pre-commit Hooks

Set up pre-commit hooks for:
- **Test Execution**: Run tests before commit
- **Linting**: Check code quality
- **Type Checking**: Verify TypeScript types

## Best Practices

### 1. Test Organization

- Group related tests in describe blocks
- Use descriptive test names
- Keep tests focused and atomic
- Avoid testing implementation details

### 2. Mock Management

- Mock at the module level, not individual functions
- Use consistent mock data
- Reset mocks between tests
- Document mock behavior

### 3. Async Testing

- Use `waitFor` for async operations
- Test loading states
- Test error conditions
- Use proper async/await patterns

### 4. Accessibility Testing

- Test keyboard navigation
- Test screen reader compatibility
- Test focus management
- Test ARIA attributes

## Common Issues and Solutions

### 1. Mock Issues

**Problem**: Mocks not working correctly
**Solution**: Check mock setup in test files and ensure proper import order

### 2. Async Testing

**Problem**: Tests failing due to async operations
**Solution**: Use `waitFor` and proper async/await patterns

### 3. Component Rendering

**Problem**: Components not rendering in tests
**Solution**: Check test setup and provider configuration

### 4. E2E Test Flakiness

**Problem**: E2E tests failing intermittently
**Solution**: Add proper waits and retry logic

## Performance Testing

### Load Testing

Test application performance with:
- **Large Form Data**: Test with extensive form inputs
- **Multiple Users**: Test concurrent user scenarios
- **Network Conditions**: Test with slow network connections

### Memory Testing

Monitor memory usage during tests:
- **Component Unmounting**: Ensure proper cleanup
- **Event Listeners**: Remove listeners on unmount
- **State Management**: Avoid memory leaks

## Security Testing

### Input Validation

Test security aspects:
- **XSS Prevention**: Test malicious input handling
- **CSRF Protection**: Test form submission security
- **Data Sanitization**: Test input cleaning

### Authentication

Test authentication flows:
- **Self Protocol Integration**: Test identity verification
- **Session Management**: Test user session handling
- **Permission Checks**: Test access control

## Conclusion

This testing strategy ensures the Merchant CDS Frontend is robust, reliable, and maintainable. Regular testing helps catch issues early and ensures a smooth user experience.

For questions or issues with testing, refer to the project documentation or create an issue in the repository.
