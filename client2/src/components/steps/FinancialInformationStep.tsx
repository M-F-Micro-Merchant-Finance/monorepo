import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { MerchantOnboardingFormData } from '../MerchantOnboardingForm';

interface FinancialInformationStepProps {
  form: UseFormReturn<MerchantOnboardingFormData>;
  onNext: () => void;
  onPrev: () => void;
}

export function FinancialInformationStep({ form, onNext, onPrev }: FinancialInformationStepProps) {
  const { register, formState: { errors }, watch, setValue } = form;

  const monthlyRevenue = watch('monthlyRevenue') || {};
  const monthlyExpenses = watch('monthlyExpenses') || {};

  // Calculate total expenses automatically
  React.useEffect(() => {
    if (monthlyExpenses.fixed !== undefined && monthlyExpenses.variable !== undefined) {
      const total = (monthlyExpenses.fixed || 0) + (monthlyExpenses.variable || 0);
      setValue('monthlyExpenses.total', total);
    }
  }, [monthlyExpenses.fixed, monthlyExpenses.variable, setValue]);

  // Calculate equity automatically
  React.useEffect(() => {
    const balanceSheet = watch('balanceSheet') || {};
    if (balanceSheet.totalAssets !== undefined && balanceSheet.totalLiabilities !== undefined) {
      const equity = (balanceSheet.totalAssets || 0) - (balanceSheet.totalLiabilities || 0);
      setValue('balanceSheet.equity', equity);
    }
  }, [watch('balanceSheet'), setValue]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Financial Information</h2>
        <p className="mt-2 text-gray-600">
          Provide your financial data for risk assessment
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Monthly Revenue Section */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Revenue</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Current Monthly Revenue (USD) *
              </label>
              <input
                type="number"
                {...register('monthlyRevenue.current', { valueAsNumber: true })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="0"
                min="0"
              />
              {errors.monthlyRevenue?.current && (
                <p className="mt-1 text-sm text-red-600">{errors.monthlyRevenue.current.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Average Monthly Revenue (USD) *
              </label>
              <input
                type="number"
                {...register('monthlyRevenue.average', { valueAsNumber: true })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="0"
                min="0"
              />
              {errors.monthlyRevenue?.average && (
                <p className="mt-1 text-sm text-red-600">{errors.monthlyRevenue.average.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Revenue Growth Rate (%) *
              </label>
              <input
                type="number"
                {...register('monthlyRevenue.growthRate', { valueAsNumber: true })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="0"
                min="-100"
                max="1000"
              />
              {errors.monthlyRevenue?.growthRate && (
                <p className="mt-1 text-sm text-red-600">{errors.monthlyRevenue.growthRate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Seasonality *
              </label>
              <select
                {...register('monthlyRevenue.seasonality')}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="low">Low Seasonality</option>
                <option value="medium">Medium Seasonality</option>
                <option value="high">High Seasonality</option>
              </select>
              {errors.monthlyRevenue?.seasonality && (
                <p className="mt-1 text-sm text-red-600">{errors.monthlyRevenue.seasonality.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Monthly Expenses Section */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Expenses</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fixed Expenses (USD) *
              </label>
              <input
                type="number"
                {...register('monthlyExpenses.fixed', { valueAsNumber: true })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="0"
                min="0"
              />
              {errors.monthlyExpenses?.fixed && (
                <p className="mt-1 text-sm text-red-600">{errors.monthlyExpenses.fixed.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Variable Expenses (USD) *
              </label>
              <input
                type="number"
                {...register('monthlyExpenses.variable', { valueAsNumber: true })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="0"
                min="0"
              />
              {errors.monthlyExpenses?.variable && (
                <p className="mt-1 text-sm text-red-600">{errors.monthlyExpenses.variable.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Total Expenses (USD) *
              </label>
              <input
                type="number"
                {...register('monthlyExpenses.total', { valueAsNumber: true })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50"
                placeholder="0"
                min="0"
                readOnly
              />
              {errors.monthlyExpenses?.total && (
                <p className="mt-1 text-sm text-red-600">{errors.monthlyExpenses.total.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Cash Flow Section */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Cash Flow</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Operating Cash Flow (USD) *
              </label>
              <input
                type="number"
                {...register('cashFlow.operating', { valueAsNumber: true })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="0"
              />
              {errors.cashFlow?.operating && (
                <p className="mt-1 text-sm text-red-600">{errors.cashFlow.operating.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Free Cash Flow (USD) *
              </label>
              <input
                type="number"
                {...register('cashFlow.free', { valueAsNumber: true })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="0"
              />
              {errors.cashFlow?.free && (
                <p className="mt-1 text-sm text-red-600">{errors.cashFlow.free.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Working Capital (USD) *
              </label>
              <input
                type="number"
                {...register('cashFlow.workingCapital', { valueAsNumber: true })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="0"
                min="0"
              />
              {errors.cashFlow?.workingCapital && (
                <p className="mt-1 text-sm text-red-600">{errors.cashFlow.workingCapital.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Balance Sheet Section */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Balance Sheet</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Total Assets (USD) *
              </label>
              <input
                type="number"
                {...register('balanceSheet.totalAssets', { valueAsNumber: true })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="0"
                min="0"
              />
              {errors.balanceSheet?.totalAssets && (
                <p className="mt-1 text-sm text-red-600">{errors.balanceSheet.totalAssets.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Current Assets (USD) *
              </label>
              <input
                type="number"
                {...register('balanceSheet.currentAssets', { valueAsNumber: true })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="0"
                min="0"
              />
              {errors.balanceSheet?.currentAssets && (
                <p className="mt-1 text-sm text-red-600">{errors.balanceSheet.currentAssets.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Total Liabilities (USD) *
              </label>
              <input
                type="number"
                {...register('balanceSheet.totalLiabilities', { valueAsNumber: true })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="0"
                min="0"
              />
              {errors.balanceSheet?.totalLiabilities && (
                <p className="mt-1 text-sm text-red-600">{errors.balanceSheet.totalLiabilities.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Current Liabilities (USD) *
              </label>
              <input
                type="number"
                {...register('balanceSheet.currentLiabilities', { valueAsNumber: true })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="0"
                min="0"
              />
              {errors.balanceSheet?.currentLiabilities && (
                <p className="mt-1 text-sm text-red-600">{errors.balanceSheet.currentLiabilities.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Equity (USD) *
              </label>
              <input
                type="number"
                {...register('balanceSheet.equity', { valueAsNumber: true })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50"
                placeholder="0"
                readOnly
              />
              {errors.balanceSheet?.equity && (
                <p className="mt-1 text-sm text-red-600">{errors.balanceSheet.equity.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Funding Intentions Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Funding Intentions</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Funding Purpose *
              </label>
              <select
                {...register('fundIntention.purpose')}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="working_capital">Working Capital</option>
                <option value="equipment">Equipment Purchase</option>
                <option value="expansion">Business Expansion</option>
                <option value="inventory">Inventory Purchase</option>
                <option value="other">Other</option>
              </select>
              {errors.fundIntention?.purpose && (
                <p className="mt-1 text-sm text-red-600">{errors.fundIntention.purpose.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Requested Amount (USD) *
                </label>
                <input
                  type="number"
                  {...register('fundIntention.amount.requested', { valueAsNumber: true })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="0"
                  min="0"
                />
                {errors.fundIntention?.amount?.requested && (
                  <p className="mt-1 text-sm text-red-600">{errors.fundIntention.amount.requested.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Minimum Amount (USD) *
                </label>
                <input
                  type="number"
                  {...register('fundIntention.amount.minimum', { valueAsNumber: true })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="0"
                  min="0"
                />
                {errors.fundIntention?.amount?.minimum && (
                  <p className="mt-1 text-sm text-red-600">{errors.fundIntention.amount.minimum.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Maximum Amount (USD) *
                </label>
                <input
                  type="number"
                  {...register('fundIntention.amount.maximum', { valueAsNumber: true })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="0"
                  min="0"
                />
                {errors.fundIntention?.amount?.maximum && (
                  <p className="mt-1 text-sm text-red-600">{errors.fundIntention.amount.maximum.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Preferred Duration (months) *
                </label>
                <input
                  type="number"
                  {...register('fundIntention.duration.preferred', { valueAsNumber: true })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="12"
                  min="1"
                  max="60"
                />
                {errors.fundIntention?.duration?.preferred && (
                  <p className="mt-1 text-sm text-red-600">{errors.fundIntention.duration.preferred.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Minimum Duration (months) *
                </label>
                <input
                  type="number"
                  {...register('fundIntention.duration.minimum', { valueAsNumber: true })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="6"
                  min="1"
                  max="60"
                />
                {errors.fundIntention?.duration?.minimum && (
                  <p className="mt-1 text-sm text-red-600">{errors.fundIntention.duration.minimum.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Maximum Duration (months) *
                </label>
                <input
                  type="number"
                  {...register('fundIntention.duration.maximum', { valueAsNumber: true })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="18"
                  min="1"
                  max="60"
                />
                {errors.fundIntention?.duration?.maximum && (
                  <p className="mt-1 text-sm text-red-600">{errors.fundIntention.duration.maximum.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Monthly Repayment Capacity (USD) *
                </label>
                <input
                  type="number"
                  {...register('fundIntention.repaymentCapacity.monthlyCapacity', { valueAsNumber: true })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="0"
                  min="0"
                />
                {errors.fundIntention?.repaymentCapacity?.monthlyCapacity && (
                  <p className="mt-1 text-sm text-red-600">{errors.fundIntention.repaymentCapacity.monthlyCapacity.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Percentage of Revenue (%) *
                </label>
                <input
                  type="number"
                  {...register('fundIntention.repaymentCapacity.percentageOfRevenue', { valueAsNumber: true })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="0"
                  min="0"
                  max="100"
                />
                {errors.fundIntention?.repaymentCapacity?.percentageOfRevenue && (
                  <p className="mt-1 text-sm text-red-600">{errors.fundIntention.repaymentCapacity.percentageOfRevenue.message}</p>
                )}
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-md font-medium text-gray-900 mb-3">Collateral Information</h4>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('fundIntention.collateral.available')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    I have collateral available
                  </label>
                </div>

                {watch('fundIntention.collateral.available') && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Collateral Type
                      </label>
                      <select
                        {...register('fundIntention.collateral.type')}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="equipment">Equipment</option>
                        <option value="real_estate">Real Estate</option>
                        <option value="inventory">Inventory</option>
                        <option value="crypto">Cryptocurrency</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Collateral Value (USD)
                      </label>
                      <input
                        type="number"
                        {...register('fundIntention.collateral.value', { valueAsNumber: true })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="0"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Liquidity Level
                      </label>
                      <select
                        {...register('fundIntention.collateral.liquidity')}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Previous
        </button>
        
        <button
          type="button"
          onClick={onNext}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
        >
          Next
        </button>
      </div>
    </div>
  );
}
