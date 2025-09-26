import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { MerchantOnboardingFormData } from '../MerchantOnboardingForm';
import { CountrySelection } from '../CountrySelection';

interface BusinessInformationStepProps {
  form: UseFormReturn<MerchantOnboardingFormData>;
  onNext: () => void;
}

export function BusinessInformationStep({ form, onNext }: BusinessInformationStepProps) {
  const { register, formState: { errors }, watch, setValue } = form;

  const businessType = watch('businessType');
  const legalStructure = watch('legalStructure');

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Business Information</h2>
        <p className="mt-2 text-gray-600">
          Tell us about your business to get started
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Business Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Business Name *
          </label>
          <input
            type="text"
            {...register('businessName')}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter your business name"
          />
          {errors.businessName && (
            <p className="mt-1 text-sm text-red-600">{errors.businessName.message}</p>
          )}
        </div>

        {/* Business Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Business Type *
          </label>
          <select
            {...register('businessType')}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select business type</option>
            <option value="sole_proprietorship">Sole Proprietorship</option>
            <option value="partnership">Partnership</option>
            <option value="corporation">Corporation</option>
            <option value="llc">Limited Liability Company (LLC)</option>
            <option value="other">Other</option>
          </select>
          {errors.businessType && (
            <p className="mt-1 text-sm text-red-600">{errors.businessType.message}</p>
          )}
        </div>

        {/* Industry */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Industry *
          </label>
          <input
            type="text"
            {...register('industry')}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="e.g., Agriculture, Retail, Manufacturing"
          />
          {errors.industry && (
            <p className="mt-1 text-sm text-red-600">{errors.industry.message}</p>
          )}
        </div>

        {/* Business Age */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Business Age (in months) *
          </label>
          <input
            type="number"
            {...register('businessAge', { valueAsNumber: true })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="0"
            min="0"
            max="1200"
          />
          {errors.businessAge && (
            <p className="mt-1 text-sm text-red-600">{errors.businessAge.message}</p>
          )}
        </div>

        {/* Legal Structure */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Legal Structure *
          </label>
          <div className="mt-2 space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="formal"
                {...register('legalStructure')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Formal (Registered)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="informal"
                {...register('legalStructure')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Informal (Unregistered)</span>
            </label>
          </div>
          {errors.legalStructure && (
            <p className="mt-1 text-sm text-red-600">{errors.legalStructure.message}</p>
          )}
        </div>

        {/* Registration Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Registration Status *
          </label>
          <div className="mt-2 space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="registered"
                {...register('registrationStatus')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Registered with government</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="unregistered"
                {...register('registrationStatus')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Not registered</span>
            </label>
          </div>
          {errors.registrationStatus && (
            <p className="mt-1 text-sm text-red-600">{errors.registrationStatus.message}</p>
          )}
        </div>

        {/* Primary Market Country */}
        <div>
          <CountrySelection
            value={watch('marketContext.primaryMarket')}
            onChange={(value) => setValue('marketContext.primaryMarket', value)}
            label="Primary Market Country *"
            required
            error={errors.marketContext?.primaryMarket?.message}
          />
        </div>

        {/* Operating Regions */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Operating Regions
          </label>
          <p className="mt-1 text-sm text-gray-500">
            Select all countries where you operate (optional)
          </p>
          <CountrySelection
            value=""
            onChange={(value) => {
              const currentRegions = watch('marketContext.operatingRegions') || [];
              if (value && !currentRegions.includes(value)) {
                setValue('marketContext.operatingRegions', [...currentRegions, value]);
              }
            }}
            label="Add Operating Region"
          />
          {watch('marketContext.operatingRegions')?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {watch('marketContext.operatingRegions').map((region, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {region}
                  <button
                    type="button"
                    onClick={() => {
                      const newRegions = watch('marketContext.operatingRegions').filter((_, i) => i !== index);
                      setValue('marketContext.operatingRegions', newRegions);
                    }}
                    className="ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500"
                  >
                    <span className="sr-only">Remove</span>
                    <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                      <path strokeLinecap="round" strokeWidth="1.5" d="m1 1 6 6m0-6L1 7" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Market Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Market Size *
          </label>
          <select
            {...register('marketContext.marketSize')}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="micro">Micro (1-10 employees)</option>
            <option value="small">Small (11-50 employees)</option>
            <option value="medium">Medium (51-250 employees)</option>
            <option value="large">Large (250+ employees)</option>
          </select>
          {errors.marketContext?.marketSize && (
            <p className="mt-1 text-sm text-red-600">{errors.marketContext.marketSize.message}</p>
          )}
        </div>

        {/* Competition Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Competition Level *
          </label>
          <select
            {...register('marketContext.competitionLevel')}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="low">Low Competition</option>
            <option value="medium">Medium Competition</option>
            <option value="high">High Competition</option>
          </select>
          {errors.marketContext?.competitionLevel && (
            <p className="mt-1 text-sm text-red-600">{errors.marketContext.competitionLevel.message}</p>
          )}
        </div>

        {/* Market Growth */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Market Growth *
          </label>
          <select
            {...register('marketContext.marketGrowth')}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="declining">Declining</option>
            <option value="stable">Stable</option>
            <option value="growing">Growing</option>
            <option value="rapidly_growing">Rapidly Growing</option>
          </select>
          {errors.marketContext?.marketGrowth && (
            <p className="mt-1 text-sm text-red-600">{errors.marketContext.marketGrowth.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
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
