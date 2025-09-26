import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BusinessInformationStep } from './steps/BusinessInformationStep';
import { FinancialInformationStep } from './steps/FinancialInformationStep';
import { SelfVerificationStep } from './steps/SelfVerificationStep';
import { ReviewAndSubmitStep } from './steps/ReviewAndSubmitStep';

const merchantOnboardingSchema = z.object({
  // Business Information
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  businessType: z.enum(['sole_proprietorship', 'partnership', 'corporation', 'llc', 'other']),
  industry: z.string().min(2, 'Industry is required'),
  businessAge: z.number().min(0).max(100, 'Invalid business age'),
  legalStructure: z.enum(['formal', 'informal']),
  registrationStatus: z.enum(['registered', 'unregistered']),
  
  // Financial Information
  monthlyRevenue: z.object({
    current: z.number().min(0),
    average: z.number().min(0),
    growthRate: z.number().min(-100).max(1000),
    seasonality: z.enum(['low', 'medium', 'high'])
  }),
  monthlyExpenses: z.object({
    fixed: z.number().min(0),
    variable: z.number().min(0),
    total: z.number().min(0)
  }),
  cashFlow: z.object({
    operating: z.number(),
    free: z.number(),
    workingCapital: z.number().min(0)
  }),
  balanceSheet: z.object({
    totalAssets: z.number().min(0),
    currentAssets: z.number().min(0),
    totalLiabilities: z.number().min(0),
    currentLiabilities: z.number().min(0),
    equity: z.number()
  }),
  
  // Funding Intentions
  fundIntention: z.object({
    purpose: z.enum(['working_capital', 'equipment', 'expansion', 'inventory', 'other']),
    amount: z.object({
      requested: z.number().min(0),
      minimum: z.number().min(0),
      maximum: z.number().min(0)
    }),
    duration: z.object({
      preferred: z.number().min(1).max(60),
      minimum: z.number().min(1).max(60),
      maximum: z.number().min(1).max(60)
    }),
    repaymentCapacity: z.object({
      monthlyCapacity: z.number().min(0),
      percentageOfRevenue: z.number().min(0).max(100)
    }),
    collateral: z.object({
      available: z.boolean(),
      type: z.enum(['equipment', 'real_estate', 'inventory', 'crypto', 'other']),
      value: z.number().min(0),
      liquidity: z.enum(['low', 'medium', 'high'])
    })
  }),
  
  // Risk Factors
  riskFactors: z.object({
    marketRisk: z.enum(['low', 'medium', 'high']),
    operationalRisk: z.enum(['low', 'medium', 'high']),
    financialRisk: z.enum(['low', 'medium', 'high']),
    economicSensitivity: z.enum(['low', 'medium', 'high']),
    regulatoryRisk: z.enum(['low', 'medium', 'high']),
    currencyRisk: z.enum(['low', 'medium', 'high']),
    paymentHistory: z.object({
      onTime: z.number().min(0).max(100),
      late: z.number().min(0).max(100),
      default: z.number().min(0).max(100)
    }),
    industryRisks: z.array(z.string())
  }),
  
  // Market Context
  marketContext: z.object({
    primaryMarket: z.string().length(2, 'Country code must be 2 characters'),
    operatingRegions: z.array(z.string().length(2)),
    marketSize: z.enum(['micro', 'small', 'medium', 'large']),
    competitionLevel: z.enum(['low', 'medium', 'high']),
    marketGrowth: z.enum(['declining', 'stable', 'growing', 'rapidly_growing'])
  }),
  
  // Compliance Profile
  complianceProfile: z.object({
    kycLevel: z.enum(['basic', 'enhanced', 'comprehensive']),
    amlRisk: z.enum(['low', 'medium', 'high']),
    regulatoryRequirements: z.array(z.string()),
    jurisdiction: z.string().length(2, 'Jurisdiction must be 2 characters')
  }),
  
  // Identity Verification Result
  verificationResult: z.object({
    verified: z.boolean(),
    payload: z.object({
      attestations: z.record(z.object({
        value: z.any()
      }))
    })
  }).optional()
});

export type MerchantOnboardingFormData = z.infer<typeof merchantOnboardingSchema>;

const STEPS = [
  { id: 1, name: 'Business Information', description: 'Basic business details' },
  { id: 2, name: 'Financial Information', description: 'Financial metrics and data' },
  { id: 3, name: 'Identity Verification', description: 'Verify identity with Self Protocol' },
  { id: 4, name: 'Review & Submit', description: 'Review and submit application' }
];

export function MerchantOnboardingForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<MerchantOnboardingFormData>({
    resolver: zodResolver(merchantOnboardingSchema),
    defaultValues: {
      businessAge: 0,
      monthlyRevenue: { current: 0, average: 0, growthRate: 0, seasonality: 'low' },
      monthlyExpenses: { fixed: 0, variable: 0, total: 0 },
      cashFlow: { operating: 0, free: 0, workingCapital: 0 },
      balanceSheet: { totalAssets: 0, currentAssets: 0, totalLiabilities: 0, currentLiabilities: 0, equity: 0 },
      fundIntention: {
        purpose: 'working_capital',
        amount: { requested: 0, minimum: 0, maximum: 0 },
        duration: { preferred: 12, minimum: 6, maximum: 18 },
        repaymentCapacity: { monthlyCapacity: 0, percentageOfRevenue: 0 },
        collateral: { available: false, type: 'equipment', value: 0, liquidity: 'medium' }
      },
      riskFactors: {
        marketRisk: 'medium',
        operationalRisk: 'medium',
        financialRisk: 'medium',
        economicSensitivity: 'medium',
        regulatoryRisk: 'low',
        currencyRisk: 'low',
        paymentHistory: { onTime: 100, late: 0, default: 0 },
        industryRisks: []
      },
      marketContext: {
        primaryMarket: '',
        operatingRegions: [],
        marketSize: 'micro',
        competitionLevel: 'medium',
        marketGrowth: 'stable'
      },
      complianceProfile: {
        kycLevel: 'basic',
        amlRisk: 'low',
        regulatoryRequirements: [],
        jurisdiction: ''
      }
    }
  });

  const onSubmit = async (data: MerchantOnboardingFormData) => {
    setIsSubmitting(true);
    try {
      // Process form data and prepare for Self Protocol verification
      console.log('Submitting merchant data:', data);
      // TODO: Implement actual submission logic
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
    } catch (error) {
      console.error('Error processing merchant data:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                currentStep >= step.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step.id}
              </div>
              <div className="ml-2 hidden sm:block">
                <div className={`text-sm font-medium ${
                  currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step.name}
                </div>
                <div className="text-xs text-gray-500">{step.description}</div>
              </div>
              {index < STEPS.length - 1 && (
                <div className={`hidden sm:block w-16 h-0.5 ml-4 ${
                  currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Step 1: Business Information */}
        {currentStep === 1 && (
          <BusinessInformationStep form={form} onNext={nextStep} />
        )}
        
        {/* Step 2: Financial Information */}
        {currentStep === 2 && (
          <FinancialInformationStep 
            form={form} 
            onNext={nextStep} 
            onPrev={prevStep} 
          />
        )}
        
        {/* Step 3: Self Protocol Verification */}
        {currentStep === 3 && (
          <SelfVerificationStep 
            form={form}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )}
        
        {/* Step 4: Review and Submit */}
        {currentStep === 4 && (
          <ReviewAndSubmitStep 
            form={form}
            onPrev={prevStep}
            isSubmitting={isSubmitting}
          />
        )}
      </form>
    </div>
  );
}
