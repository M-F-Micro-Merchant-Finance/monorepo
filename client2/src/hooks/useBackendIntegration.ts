import { useState, useCallback } from 'react';
import { BackendIntegrationService, BackendResponse } from '../services/backendIntegration.service';
import { MerchantOnboardingFormData, SelfVerificationResult } from '../types/contracts';

export interface UseBackendIntegrationReturn {
  // State
  isLoading: boolean;
  error: string | null;
  lastResponse: BackendResponse | null;

  // Actions
  processMerchantOnboarding: (
    formData: MerchantOnboardingFormData,
    verificationResult: SelfVerificationResult,
    merchantAddress: string
  ) => Promise<BackendResponse>;
  
  verifyIdentity: (
    proof: string,
    publicSignals: string[],
    attestationId: number,
    userContextData: string,
    merchantAddress: string
  ) => Promise<BackendResponse>;
  
  getVerificationStatus: (merchantAddress: string) => Promise<BackendResponse>;
  getHealthStatus: () => Promise<BackendResponse>;
  getMetrics: () => Promise<BackendResponse>;
  
  // Utilities
  clearError: () => void;
  validateSelfVerificationResult: (result: SelfVerificationResult) => boolean;
  handleBackendError: (error: any) => string;
}

export function useBackendIntegration(baseUrl?: string): UseBackendIntegrationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<BackendResponse | null>(null);

  const backendService = new BackendIntegrationService(baseUrl);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((error: any) => {
    const errorMessage = backendService.handleBackendError(error);
    setError(errorMessage);
    console.error('Backend integration error:', error);
    return errorMessage;
  }, [backendService]);

  const processMerchantOnboarding = useCallback(async (
    formData: MerchantOnboardingFormData,
    verificationResult: SelfVerificationResult,
    merchantAddress: string
  ): Promise<BackendResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate Self Protocol verification result
      if (!backendService.validateSelfVerificationResult(verificationResult)) {
        throw new Error('Invalid Self Protocol verification result');
      }

      // Transform form data for backend
      const transformedFormData = backendService.transformFormDataForBackend(formData);

      // Process onboarding
      const response = await backendService.processMerchantOnboarding(
        transformedFormData,
        verificationResult,
        merchantAddress
      );

      setLastResponse(response);
      return response;
    } catch (error) {
      const errorMessage = handleError(error);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [backendService, handleError]);

  const verifyIdentity = useCallback(async (
    proof: string,
    publicSignals: string[],
    attestationId: number,
    userContextData: string,
    merchantAddress: string
  ): Promise<BackendResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await backendService.verifyIdentity(
        proof,
        publicSignals,
        attestationId,
        userContextData,
        merchantAddress
      );

      setLastResponse(response);
      return response;
    } catch (error) {
      const errorMessage = handleError(error);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [backendService, handleError]);

  const getVerificationStatus = useCallback(async (merchantAddress: string): Promise<BackendResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await backendService.getVerificationStatus(merchantAddress);
      setLastResponse(response);
      return response;
    } catch (error) {
      const errorMessage = handleError(error);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [backendService, handleError]);

  const getHealthStatus = useCallback(async (): Promise<BackendResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await backendService.getHealthStatus();
      setLastResponse(response);
      return response;
    } catch (error) {
      const errorMessage = handleError(error);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [backendService, handleError]);

  const getMetrics = useCallback(async (): Promise<BackendResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await backendService.getMetrics();
      setLastResponse(response);
      return response;
    } catch (error) {
      const errorMessage = handleError(error);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [backendService, handleError]);

  const validateSelfVerificationResult = useCallback((result: SelfVerificationResult): boolean => {
    return backendService.validateSelfVerificationResult(result);
  }, [backendService]);

  const handleBackendError = useCallback((error: any): string => {
    return backendService.handleBackendError(error);
  }, [backendService]);

  return {
    // State
    isLoading,
    error,
    lastResponse,

    // Actions
    processMerchantOnboarding,
    verifyIdentity,
    getVerificationStatus,
    getHealthStatus,
    getMetrics,

    // Utilities
    clearError,
    validateSelfVerificationResult,
    handleBackendError
  };
}
