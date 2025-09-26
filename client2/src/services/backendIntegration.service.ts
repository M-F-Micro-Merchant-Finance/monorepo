import { MerchantOnboardingFormData, SelfVerificationResult } from '../types/contracts';

export interface BackendResponse {
  success: boolean;
  transactionHash?: string;
  verificationId?: string;
  contractData?: any;
  error?: string;
  code?: string;
  timestamp?: number;
}

export class BackendIntegrationService {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  /**
   * Process complete merchant onboarding with Self Protocol verification
   */
  async processMerchantOnboarding(
    formData: MerchantOnboardingFormData,
    verificationResult: SelfVerificationResult,
    merchantAddress: string
  ): Promise<BackendResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/merchant/onboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData,
          verificationResult,
          merchantAddress
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Backend request failed');
      }

      return data;
    } catch (error) {
      console.error('Backend integration error:', error);
      throw error;
    }
  }

  /**
   * Verify merchant identity using Self Protocol
   */
  async verifyIdentity(
    proof: string,
    publicSignals: string[],
    attestationId: number,
    userContextData: string,
    merchantAddress: string
  ): Promise<BackendResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/verify/identity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proof,
          publicSignals,
          attestationId,
          userContextData,
          merchantAddress
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Identity verification failed');
      }

      return data;
    } catch (error) {
      console.error('Identity verification error:', error);
      throw error;
    }
  }

  /**
   * Check merchant verification status
   */
  async getVerificationStatus(merchantAddress: string): Promise<BackendResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/verify/status/${merchantAddress}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get verification status');
      }

      return data;
    } catch (error) {
      console.error('Status check error:', error);
      throw error;
    }
  }

  /**
   * Get backend health status
   */
  async getHealthStatus(): Promise<BackendResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Health check failed');
      }

      return data;
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  }

  /**
   * Get verification metrics
   */
  async getMetrics(): Promise<BackendResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/metrics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get metrics');
      }

      return data;
    } catch (error) {
      console.error('Metrics error:', error);
      throw error;
    }
  }

  /**
   * Validate Self Protocol verification result
   */
  validateSelfVerificationResult(result: SelfVerificationResult): boolean {
    if (!result.isValid) {
      console.warn('Self Protocol verification result is invalid');
      return false;
    }

    if (!result.credentialSubject) {
      console.warn('Self Protocol verification result missing credential subject');
      return false;
    }

    // Check minimum age requirement
    const minAge = 18;
    if (result.credentialSubject.age && result.credentialSubject.age < minAge) {
      console.warn('User does not meet minimum age requirement', {
        age: result.credentialSubject.age,
        minAge
      });
      return false;
    }

    return true;
  }

  /**
   * Transform form data for backend processing
   */
  transformFormDataForBackend(formData: MerchantOnboardingFormData): any {
    return {
      ...formData,
      // Add any additional transformations needed for backend
      processedAt: new Date().toISOString()
    };
  }

  /**
   * Handle backend errors with user-friendly messages
   */
  handleBackendError(error: any): string {
    if (error.code) {
      switch (error.code) {
        case 'INVALID_VERIFICATION':
          return 'Identity verification failed. Please try again with valid credentials.';
        case 'VERIFICATION_FAILED':
          return 'Self Protocol verification failed. Please check your identity documents.';
        case 'CONTRACT_ERROR':
          return 'Blockchain transaction failed. Please try again.';
        case 'VALIDATION_ERROR':
          return 'Please check your form data and try again.';
        case 'RATE_LIMIT_EXCEEDED':
          return 'Too many requests. Please wait a moment and try again.';
        default:
          return error.message || 'An unexpected error occurred. Please try again.';
      }
    }

    return error.message || 'An unexpected error occurred. Please try again.';
  }
}
