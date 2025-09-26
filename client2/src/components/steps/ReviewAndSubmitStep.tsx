import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { MerchantOnboardingFormData } from '../MerchantOnboardingForm';

interface ReviewAndSubmitStepProps {
  form: UseFormReturn<MerchantOnboardingFormData>;
  onPrev: () => void;
  isSubmitting: boolean;
}

export function ReviewAndSubmitStep({ form, onPrev, isSubmitting }: ReviewAndSubmitStepProps) {
  const { watch } = form;
  const formData = watch();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value}%`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Review & Submit</h2>
        <p className="mt-2 text-gray-600">
          Please review your information before submitting
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Business Information Review */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Business Information</h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Business Name</dt>
              <dd className="text-sm text-gray-900">{formData.businessName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Business Type</dt>
              <dd className="text-sm text-gray-900 capitalize">{formData.businessType?.replace('_', ' ')}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Industry</dt>
              <dd className="text-sm text-gray-900">{formData.industry}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Business Age</dt>
              <dd className="text-sm text-gray-900">{formData.businessAge} months</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Legal Structure</dt>
              <dd className="text-sm text-gray-900 capitalize">{formData.legalStructure}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Registration Status</dt>
              <dd className="text-sm text-gray-900 capitalize">{formData.registrationStatus}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Primary Market</dt>
              <dd className="text-sm text-gray-900">{formData.marketContext?.primaryMarket}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Market Size</dt>
              <dd className="text-sm text-gray-900 capitalize">{formData.marketContext?.marketSize}</dd>
            </div>
          </dl>
        </div>

        {/* Financial Information Review */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Information</h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Current Monthly Revenue</dt>
              <dd className="text-sm text-gray-900">{formatCurrency(formData.monthlyRevenue?.current || 0)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Average Monthly Revenue</dt>
              <dd className="text-sm text-gray-900">{formatCurrency(formData.monthlyRevenue?.average || 0)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Revenue Growth Rate</dt>
              <dd className="text-sm text-gray-900">{formatPercentage(formData.monthlyRevenue?.growthRate || 0)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Total Monthly Expenses</dt>
              <dd className="text-sm text-gray-900">{formatCurrency(formData.monthlyExpenses?.total || 0)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Total Assets</dt>
              <dd className="text-sm text-gray-900">{formatCurrency(formData.balanceSheet?.totalAssets || 0)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Total Liabilities</dt>
              <dd className="text-sm text-gray-900">{formatCurrency(formData.balanceSheet?.totalLiabilities || 0)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Equity</dt>
              <dd className="text-sm text-gray-900">{formatCurrency(formData.balanceSheet?.equity || 0)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Working Capital</dt>
              <dd className="text-sm text-gray-900">{formatCurrency(formData.cashFlow?.workingCapital || 0)}</dd>
            </div>
          </dl>
        </div>

        {/* Funding Intentions Review */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Funding Intentions</h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Funding Purpose</dt>
              <dd className="text-sm text-gray-900 capitalize">{formData.fundIntention?.purpose?.replace('_', ' ')}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Requested Amount</dt>
              <dd className="text-sm text-gray-900">{formatCurrency(formData.fundIntention?.amount?.requested || 0)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Preferred Duration</dt>
              <dd className="text-sm text-gray-900">{formData.fundIntention?.duration?.preferred} months</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Monthly Repayment Capacity</dt>
              <dd className="text-sm text-gray-900">{formatCurrency(formData.fundIntention?.repaymentCapacity?.monthlyCapacity || 0)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Collateral Available</dt>
              <dd className="text-sm text-gray-900">{formData.fundIntention?.collateral?.available ? 'Yes' : 'No'}</dd>
            </div>
            {formData.fundIntention?.collateral?.available && (
              <>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Collateral Type</dt>
                  <dd className="text-sm text-gray-900 capitalize">{formData.fundIntention?.collateral?.type?.replace('_', ' ')}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Collateral Value</dt>
                  <dd className="text-sm text-gray-900">{formatCurrency(formData.fundIntention?.collateral?.value || 0)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Collateral Liquidity</dt>
                  <dd className="text-sm text-gray-900 capitalize">{formData.fundIntention?.collateral?.liquidity}</dd>
                </div>
              </>
            )}
          </dl>
        </div>

        {/* Risk Factors Review */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Risk Assessment</h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Market Risk</dt>
              <dd className="text-sm text-gray-900 capitalize">{formData.riskFactors?.marketRisk}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Operational Risk</dt>
              <dd className="text-sm text-gray-900 capitalize">{formData.riskFactors?.operationalRisk}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Financial Risk</dt>
              <dd className="text-sm text-gray-900 capitalize">{formData.riskFactors?.financialRisk}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Regulatory Risk</dt>
              <dd className="text-sm text-gray-900 capitalize">{formData.riskFactors?.regulatoryRisk}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">On-Time Payments</dt>
              <dd className="text-sm text-gray-900">{formatPercentage(formData.riskFactors?.paymentHistory?.onTime || 0)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Late Payments</dt>
              <dd className="text-sm text-gray-900">{formatPercentage(formData.riskFactors?.paymentHistory?.late || 0)}</dd>
            </div>
          </dl>
        </div>

        {/* Compliance Profile Review */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Compliance Profile</h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">KYC Level</dt>
              <dd className="text-sm text-gray-900 capitalize">{formData.complianceProfile?.kycLevel}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">AML Risk</dt>
              <dd className="text-sm text-gray-900 capitalize">{formData.complianceProfile?.amlRisk}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Jurisdiction</dt>
              <dd className="text-sm text-gray-900">{formData.complianceProfile?.jurisdiction}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Regulatory Requirements</dt>
              <dd className="text-sm text-gray-900">
                {formData.complianceProfile?.regulatoryRequirements?.length > 0 
                  ? formData.complianceProfile.regulatoryRequirements.join(', ')
                  : 'None specified'
                }
              </dd>
            </div>
          </dl>
        </div>

        {/* Identity Verification Status */}
        {formData.verificationResult && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Identity Verified Successfully
                </h3>
                <p className="mt-1 text-sm text-green-700">
                  Your identity has been verified using Self Protocol.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Terms and Conditions */}
        <div className="border-t pt-4">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                required
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label className="text-gray-700">
                I agree to the{' '}
                <a href="#" className="text-blue-600 hover:text-blue-500">
                  Terms and Conditions
                </a>{' '}
                and{' '}
                <a href="#" className="text-blue-600 hover:text-blue-500">
                  Privacy Policy
                </a>
                . I understand that my information will be used for credit assessment and CDS token creation.
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          disabled={isSubmitting}
        >
          Previous
        </button>
        
        <button
          type="submit"
          disabled={isSubmitting || !formData.verificationResult}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </div>
          ) : (
            'Submit Application'
          )}
        </button>
      </div>
    </div>
  );
}
