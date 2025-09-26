import { Request, Response } from 'express';
import { VerificationService } from '../services/verification.service';
import { ContractService } from '../services/contract.service';
import { FrontendIntegrationService } from '../services/frontend-integration.service';
import { Logger } from '../utils/logger';
import { 
  VerificationRequest, 
  VerificationResponse, 
  StatusResponse,
  VerificationError,
  HttpStatusCode,
  MerchantOnboardingFormData,
  SelfVerificationResult
} from '../types/verification.types';

export class VerificationController {
  private verificationService: VerificationService;
  private contractService: ContractService;
  private frontendIntegrationService: FrontendIntegrationService;
  private logger: Logger;

  constructor() {
    this.verificationService = new VerificationService();
    this.contractService = new ContractService();
    this.frontendIntegrationService = new FrontendIntegrationService();
    this.logger = Logger.getInstance();
  }

  public async verifyIdentity(req: Request, res: Response): Promise<void> {
    try {
      const verificationRequest: VerificationRequest = req.body;

      this.logger.info('Received verification request', {
        merchantAddress: verificationRequest.merchantAddress,
        attestationId: verificationRequest.attestationId
      });

      // Step 1: Verify with Self Protocol
      const verificationResult = await this.verificationService.verifyIdentity(verificationRequest);

      if (!verificationResult.success) {
        this.logger.warn('Self Protocol verification failed', {
          merchantAddress: verificationRequest.merchantAddress,
          error: verificationResult.error
        });

        res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          error: verificationResult.error,
          code: 'VERIFICATION_FAILED'
        });
        return;
      }

      // Step 2: Update smart contract
      const contractResult = await this.contractService.verifyMerchantIdentity(
        verificationRequest.proof,
        verificationRequest.userContextData
      );

      if (!contractResult.success) {
        this.logger.error('Contract interaction failed', {
          merchantAddress: verificationRequest.merchantAddress,
          error: contractResult.error
        });

        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          error: 'Contract interaction failed',
          details: contractResult.error,
          code: 'CONTRACT_ERROR'
        });
        return;
      }

      // Step 3: Return success response
      const response: VerificationResponse = {
        success: true,
        transactionHash: contractResult.transactionHash,
        verificationId: verificationResult.verificationId,
        timestamp: verificationResult.timestamp
      };

      this.logger.info('Verification completed successfully', {
        merchantAddress: verificationRequest.merchantAddress,
        transactionHash: contractResult.transactionHash,
        verificationId: verificationResult.verificationId
      });

      res.status(HttpStatusCode.OK).json(response);

    } catch (error) {
      this.logger.error('Unexpected error in verifyIdentity', error, {
        body: req.body
      });

      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  public async getVerificationStatus(req: Request, res: Response): Promise<void> {
    try {
      const { merchantAddress } = req.params;

      if (!merchantAddress || !this.isValidAddress(merchantAddress)) {
        res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          error: 'Invalid merchant address',
          code: 'INVALID_ADDRESS'
        });
        return;
      }

      this.logger.info('Checking verification status', { merchantAddress });

      // Check contract for verification status
      const isVerified = await this.contractService.isVerifiedMerchant(merchantAddress);

      const response: StatusResponse = {
        isVerified,
        merchantAddress,
        verificationTimestamp: isVerified ? Date.now() : undefined
      };

      this.logger.info('Verification status retrieved', {
        merchantAddress,
        isVerified
      });

      res.status(HttpStatusCode.OK).json(response);

    } catch (error) {
      this.logger.error('Error getting verification status', error, {
        merchantAddress: req.params.merchantAddress
      });

      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to get verification status',
        code: 'STATUS_ERROR'
      });
    }
  }

  public async getHealthStatus(req: Request, res: Response): Promise<void> {
    try {
      const networkInfo = await this.contractService.getNetworkInfo();
      const gasPrice = await this.contractService.getGasPrice();

      const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          selfProtocol: 'connected',
          celoNetwork: 'connected',
          contract: 'connected'
        },
        network: {
          chainId: networkInfo.chainId,
          blockNumber: networkInfo.blockNumber,
          gasPrice: gasPrice.toString()
        },
        contract: {
          address: this.contractService.getContractAddress(),
          wallet: this.contractService.getWalletAddress()
        }
      };

      res.status(HttpStatusCode.OK).json(healthStatus);

    } catch (error) {
      this.logger.error('Health check failed', error);

      res.status(HttpStatusCode.SERVICE_UNAVAILABLE).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  public async getMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = this.verificationService.getVerificationMetrics();
      
      res.status(HttpStatusCode.OK).json({
        success: true,
        metrics
      });

    } catch (error) {
      this.logger.error('Failed to get metrics', error);

      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to get metrics',
        code: 'METRICS_ERROR'
      });
    }
  }

  public async processMerchantOnboarding(req: Request, res: Response): Promise<void> {
    try {
      const { formData, verificationResult, merchantAddress } = req.body;

      this.logger.info('Processing merchant onboarding', {
        merchantAddress,
        businessName: formData?.businessName
      });

      // Validate Self Protocol verification result
      if (!this.frontendIntegrationService.validateSelfVerificationResult(verificationResult)) {
        res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          error: 'Invalid Self Protocol verification result',
          code: 'INVALID_VERIFICATION'
        });
        return;
      }

      // Transform form data to contract format
      const contractData = this.frontendIntegrationService.transformFormDataToContractData(
        formData,
        verificationResult,
        merchantAddress
      );

      // Verify identity with Self Protocol
      const verificationRequest = this.frontendIntegrationService.createVerificationRequest(
        formData,
        verificationResult,
        merchantAddress
      );

      const verificationResponse = await this.verificationService.verifyIdentity(verificationRequest);

      if (!verificationResponse.success) {
        res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          error: verificationResponse.error,
          code: 'VERIFICATION_FAILED'
        });
        return;
      }

      // Update smart contract with verification
      const contractResult = await this.contractService.verifyMerchantIdentity(
        verificationResult.proof,
        verificationResult.userContextData
      );

      if (!contractResult.success) {
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          error: 'Contract interaction failed',
          details: contractResult.error,
          code: 'CONTRACT_ERROR'
        });
        return;
      }

      // Return success response with contract data
      res.status(HttpStatusCode.OK).json({
        success: true,
        transactionHash: contractResult.transactionHash,
        verificationId: verificationResponse.verificationId,
        contractData,
        timestamp: Date.now()
      });

    } catch (error) {
      this.logger.error('Unexpected error in processMerchantOnboarding', error, {
        body: req.body
      });

      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  private isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  // Error handling middleware
  public handleError(error: Error, req: Request, res: Response, next: any): void {
    this.logger.error('Unhandled error', error, {
      url: req.url,
      method: req.method,
      body: req.body
    });

    if (error instanceof VerificationError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.code,
        details: error.details
      });
    } else {
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }
}
