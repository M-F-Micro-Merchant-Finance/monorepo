import { SelfBackendVerifier, AllIds, DefaultConfigStore } from '@selfxyz/core';
import { ConfigService } from './config.service';
import { Logger } from '../utils/logger';
import { 
  VerificationRequest, 
  VerificationResponse, 
  SelfVerificationResult,
  VerificationError,
  VerificationErrorCode,
  SelfProofData
} from '../types/verification.types';

export class VerificationService {
  private verifier: SelfBackendVerifier;
  private config: ConfigService;
  private logger: Logger;

  constructor() {
    this.config = ConfigService.getInstance();
    this.logger = Logger.getInstance();
    this.verifier = this.initializeVerifier();
  }

  private initializeVerifier(): SelfBackendVerifier {
    const verificationConfig = this.config.getVerificationConfig();
    
    try {
      const verifier = new SelfBackendVerifier(
        verificationConfig.selfAppName,
        verificationConfig.selfEndpoint,
        verificationConfig.mockPassport,
        AllIds,
        new DefaultConfigStore({
          minimumAge: verificationConfig.minimumAge,
          excludedCountries: verificationConfig.excludedCountries,
          ofac: verificationConfig.ofac,
        }),
        'hex' // userIdentifierType
      );

      this.logger.info('Self Protocol verifier initialized', {
        appName: verificationConfig.selfAppName,
        endpoint: verificationConfig.selfEndpoint,
        mockPassport: verificationConfig.mockPassport
      });

      return verifier;
    } catch (error) {
      this.logger.error('Failed to initialize Self Protocol verifier', error);
      throw new VerificationError(
        'Failed to initialize Self Protocol verifier',
        VerificationErrorCode.CONFIGURATION_ERROR,
        500,
        { originalError: error }
      );
    }
  }

  public async verifyIdentity(request: VerificationRequest): Promise<VerificationResponse> {
    const startTime = Date.now();
    const { merchantAddress, attestationId } = request;

    this.logger.logVerificationStart(merchantAddress, attestationId);

    try {
      // Validate input
      this.validateVerificationRequest(request);

      // Prepare proof data
      const proofData: SelfProofData = {
        proof: request.proof,
        publicSignals: request.publicSignals,
        attestationId: request.attestationId as 1 | 2 | 3,
        userContextData: request.userContextData
      };

      // Verify proof with Self Protocol
      const result = await this.verifyProof(proofData);

      if (!result.isValidDetails.isValid) {
        const errorMessage = result.isValidDetails.error || 'Proof verification failed';
        this.logger.logVerificationFailure(merchantAddress, errorMessage, Date.now() - startTime);
        
        return {
          success: false,
          error: errorMessage
        };
      }

      // Log successful verification
      const duration = Date.now() - startTime;
      this.logger.logVerificationSuccess(merchantAddress, 'pending', duration);

      return {
        success: true,
        verificationId: this.generateVerificationId(merchantAddress),
        timestamp: Date.now()
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.logVerificationFailure(merchantAddress, error instanceof Error ? error.message : 'Unknown error', duration);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Verification failed'
      };
    }
  }

  private async verifyProof(proofData: SelfProofData): Promise<SelfVerificationResult> {
    try {
      this.logger.debug('Verifying proof with Self Protocol', {
        attestationId: proofData.attestationId,
        hasProof: !!proofData.proof,
        publicSignalsCount: proofData.publicSignals.length
      });

      const result = await this.verifier.verify(
        proofData.attestationId,
        proofData.proof,
        proofData.publicSignals,
        proofData.userContextData
      );

      this.logger.debug('Self Protocol verification completed', {
        isValid: result.isValidDetails.isValid,
        disclosedAttributes: Object.keys(result.discloseOutput || {})
      });

      return result;

    } catch (error) {
      this.logger.logSelfProtocolError('verify', error instanceof Error ? error.message : 'Unknown error');
      throw new VerificationError(
        'Self Protocol verification failed',
        VerificationErrorCode.INVALID_PROOF,
        400,
        { originalError: error }
      );
    }
  }

  private validateVerificationRequest(request: VerificationRequest): void {
    const errors: string[] = [];

    if (!request.proof || typeof request.proof !== 'string') {
      errors.push('Proof is required and must be a string');
    }

    if (!request.publicSignals || !Array.isArray(request.publicSignals)) {
      errors.push('Public signals are required and must be an array');
    }

    if (!request.attestationId || ![1, 2, 3].includes(request.attestationId)) {
      errors.push('Attestation ID must be 1 (Passport), 2 (EU ID Card), or 3 (Aadhaar)');
    }

    if (!request.userContextData || typeof request.userContextData !== 'string') {
      errors.push('User context data is required and must be a string');
    }

    if (!request.merchantAddress || !this.isValidAddress(request.merchantAddress)) {
      errors.push('Merchant address is required and must be a valid Ethereum address');
    }

    if (errors.length > 0) {
      throw new VerificationError(
        `Validation failed: ${errors.join(', ')}`,
        VerificationErrorCode.VALIDATION_ERROR,
        400,
        { errors }
      );
    }
  }

  private isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  private generateVerificationId(merchantAddress: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `verification_${merchantAddress.slice(2, 8)}_${timestamp}_${random}`;
  }

  public async getVerificationStatus(merchantAddress: string): Promise<{ isVerified: boolean; details?: any }> {
    try {
      // This would typically check against a database or contract
      // For now, we'll return a mock response
      this.logger.debug('Checking verification status', { merchantAddress });
      
      return {
        isVerified: false, // This should be implemented based on your storage solution
        details: {
          merchantAddress,
          lastChecked: Date.now()
        }
      };
    } catch (error) {
      this.logger.error('Failed to get verification status', error, { merchantAddress });
      throw new VerificationError(
        'Failed to get verification status',
        VerificationErrorCode.UNKNOWN_ERROR,
        500,
        { originalError: error }
      );
    }
  }

  public getVerificationMetrics(): any {
    // This would typically return metrics from a monitoring system
    return {
      totalVerifications: 0,
      successfulVerifications: 0,
      failedVerifications: 0,
      averageVerificationTime: 0,
      lastVerificationTime: null
    };
  }
}
