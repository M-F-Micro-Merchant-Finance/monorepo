import { test, expect } from '@playwright/test';

test.describe('Merchant Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('completes full onboarding flow', async ({ page }) => {
    // Step 1: Business Information
    await expect(page.getByText('Business Information')).toBeVisible();
    
    // Fill business information
    await page.fill('input[name="businessName"]', 'Test Business');
    await page.selectOption('select[name="businessType"]', 'sole_proprietorship');
    await page.fill('input[name="industry"]', 'Technology');
    await page.fill('input[name="businessAge"]', '24');
    await page.check('input[value="formal"]');
    await page.check('input[value="registered"]');
    await page.selectOption('select[name="marketContext.primaryMarket"]', 'US');
    await page.selectOption('select[name="marketContext.marketSize"]', 'small');
    await page.selectOption('select[name="marketContext.competitionLevel"]', 'medium');
    await page.selectOption('select[name="marketContext.marketGrowth"]', 'growing');
    
    // Navigate to next step
    await page.click('button:has-text("Next")');
    
    // Step 2: Financial Information
    await expect(page.getByText('Financial Information')).toBeVisible();
    
    // Fill financial information
    await page.fill('input[name="monthlyRevenue.current"]', '10000');
    await page.fill('input[name="monthlyRevenue.average"]', '9500');
    await page.fill('input[name="monthlyRevenue.growthRate"]', '15');
    await page.selectOption('select[name="monthlyRevenue.seasonality"]', 'medium');
    
    await page.fill('input[name="monthlyExpenses.fixed"]', '3000');
    await page.fill('input[name="monthlyExpenses.variable"]', '2000');
    
    await page.fill('input[name="cashFlow.operating"]', '5000');
    await page.fill('input[name="cashFlow.free"]', '2000');
    await page.fill('input[name="cashFlow.workingCapital"]', '10000');
    
    await page.fill('input[name="balanceSheet.totalAssets"]', '100000');
    await page.fill('input[name="balanceSheet.currentAssets"]', '25000');
    await page.fill('input[name="balanceSheet.totalLiabilities"]', '20000');
    await page.fill('input[name="balanceSheet.currentLiabilities"]', '5000');
    
    // Funding intentions
    await page.selectOption('select[name="fundIntention.purpose"]', 'working_capital');
    await page.fill('input[name="fundIntention.amount.requested"]', '50000');
    await page.fill('input[name="fundIntention.amount.minimum"]', '30000');
    await page.fill('input[name="fundIntention.amount.maximum"]', '80000');
    await page.fill('input[name="fundIntention.duration.preferred"]', '12');
    await page.fill('input[name="fundIntention.duration.minimum"]', '6');
    await page.fill('input[name="fundIntention.duration.maximum"]', '18');
    await page.fill('input[name="fundIntention.repaymentCapacity.monthlyCapacity"]', '5000');
    await page.fill('input[name="fundIntention.repaymentCapacity.percentageOfRevenue"]', '50');
    
    // Collateral information
    await page.check('input[name="fundIntention.collateral.available"]');
    await page.selectOption('select[name="fundIntention.collateral.type"]', 'equipment');
    await page.fill('input[name="fundIntention.collateral.value"]', '75000');
    await page.selectOption('select[name="fundIntention.collateral.liquidity"]', 'medium');
    
    // Navigate to next step
    await page.click('button:has-text("Next")');
    
    // Step 3: Identity Verification
    await expect(page.getByText('Identity Verification')).toBeVisible();
    await expect(page.getByText('Must be 18 years or older')).toBeVisible();
    
    // Wait for QR code to appear (or deep link button on mobile)
    await expect(page.getByTestId('qr-code')).toBeVisible();
    
    // Simulate successful verification (in real test, this would be done by Self app)
    await page.waitForSelector('text=Identity Verified Successfully', { timeout: 10000 });
    
    // Navigate to next step
    await page.click('button:has-text("Next")');
    
    // Step 4: Review and Submit
    await expect(page.getByText('Review & Submit')).toBeVisible();
    
    // Verify all data is displayed correctly
    await expect(page.getByText('Test Business')).toBeVisible();
    await expect(page.getByText('Sole Proprietorship')).toBeVisible();
    await expect(page.getByText('Technology')).toBeVisible();
    await expect(page.getByText('$10,000')).toBeVisible();
    await expect(page.getByText('$50,000')).toBeVisible();
    
    // Accept terms and conditions
    await page.check('input[type="checkbox"]');
    
    // Submit application
    await page.click('button:has-text("Submit Application")');
    
    // Verify submission (in real test, this would show success message)
    await expect(page.getByText('Submitting...')).toBeVisible();
  });

  test('validates required fields', async ({ page }) => {
    // Try to navigate to next step without filling required fields
    await page.click('button:has-text("Next")');
    
    // Should show validation errors
    await expect(page.getByText('Business name must be at least 2 characters')).toBeVisible();
  });

  test('navigates between steps correctly', async ({ page }) => {
    // Fill some data and go to step 2
    await page.fill('input[name="businessName"]', 'Test Business');
    await page.selectOption('select[name="businessType"]', 'sole_proprietorship');
    await page.fill('input[name="industry"]', 'Technology');
    await page.fill('input[name="businessAge"]', '24');
    await page.check('input[value="formal"]');
    await page.check('input[value="registered"]');
    await page.selectOption('select[name="marketContext.primaryMarket"]', 'US');
    await page.selectOption('select[name="marketContext.marketSize"]', 'small');
    await page.selectOption('select[name="marketContext.competitionLevel"]', 'medium');
    await page.selectOption('select[name="marketContext.marketGrowth"]', 'growing');
    
    await page.click('button:has-text("Next")');
    
    // Go back to step 1
    await page.click('button:has-text("Previous")');
    
    // Verify we're back on step 1
    await expect(page.getByText('Business Information')).toBeVisible();
    
    // Data should be preserved
    await expect(page.getByDisplayValue('Test Business')).toBeVisible();
  });

  test('shows progress indicator', async ({ page }) => {
    // Check that all step numbers are visible
    await expect(page.getByText('1')).toBeVisible();
    await expect(page.getByText('2')).toBeVisible();
    await expect(page.getByText('3')).toBeVisible();
    await expect(page.getByText('4')).toBeVisible();
    
    // Check that step descriptions are visible
    await expect(page.getByText('Business Information')).toBeVisible();
    await expect(page.getByText('Financial Information')).toBeVisible();
    await expect(page.getByText('Identity Verification')).toBeVisible();
    await expect(page.getByText('Review & Submit')).toBeVisible();
  });

  test('handles mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Should show deep link button instead of QR code
    await expect(page.getByText('Open Self App')).toBeVisible();
  });

  test('calculates financial metrics automatically', async ({ page }) => {
    // Go to financial step
    await page.fill('input[name="businessName"]', 'Test Business');
    await page.selectOption('select[name="businessType"]', 'sole_proprietorship');
    await page.fill('input[name="industry"]', 'Technology');
    await page.fill('input[name="businessAge"]', '24');
    await page.check('input[value="formal"]');
    await page.check('input[value="registered"]');
    await page.selectOption('select[name="marketContext.primaryMarket"]', 'US');
    await page.selectOption('select[name="marketContext.marketSize"]', 'small');
    await page.selectOption('select[name="marketContext.competitionLevel"]', 'medium');
    await page.selectOption('select[name="marketContext.marketGrowth"]', 'growing');
    
    await page.click('button:has-text("Next")');
    
    // Fill fixed and variable expenses
    await page.fill('input[name="monthlyExpenses.fixed"]', '3000');
    await page.fill('input[name="monthlyExpenses.variable"]', '2000');
    
    // Total should be calculated automatically
    await expect(page.getByDisplayValue('5000')).toBeVisible();
    
    // Fill assets and liabilities
    await page.fill('input[name="balanceSheet.totalAssets"]', '100000');
    await page.fill('input[name="balanceSheet.totalLiabilities"]', '20000');
    
    // Equity should be calculated automatically
    await expect(page.getByDisplayValue('80000')).toBeVisible();
  });
});
