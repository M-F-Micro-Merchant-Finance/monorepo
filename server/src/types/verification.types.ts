// Core types for merchant identity verification

export interface VerificationRequest {
  proof: string;
  publicSignals: string[];
  attestationId: number;
  userContextData: string;
  merchantAddress: string;
}

export interface VerificationResponse {
  success: boolean;
  transactionHash?: string;
  error?: string;
  verificationId?: string;
  timestamp?: number;
}

export interface StatusResponse {
  isVerified: boolean;
  verificationTimestamp?: number;
  documentType?: number;
  merchantAddress: string;
}

export interface SelfVerificationResult {
  isValidDetails: {
    isValid: boolean;
    error?: string;
  };
  discloseOutput: {
    nationality?: string;
    age?: number;
    gender?: string;
    [key: string]: any;
  };
}

export interface VerificationConfig {
  selfAppName: string;
  selfScope: string;
  selfEndpoint: string;
  minimumAge: number;
  excludedCountries: string[];
  ofac: boolean;
  mockPassport: boolean;
}

export interface ContractConfig {
  celoRpcUrl: string;
  contractAddress: string;
  privateKey: string;
  chainId: number;
}

export interface AppConfig {
  port: number;
  nodeEnv: string;
  verification: VerificationConfig;
  contract: ContractConfig;
  logging: {
    level: string;
    file: string;
  };
}

export interface VerificationError extends Error {
  code: string;
  statusCode: number;
  details?: any;
}

export interface MerchantVerificationData {
  merchantAddress: string;
  verificationTimestamp: number;
  documentType: number;
  nullifier: string;
  isActive: boolean;
}

export interface ContractInteractionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  gasUsed?: number;
}

// Self Protocol specific types
export type AttestationId = 1 | 2 | 3; // 1 = Passport, 2 = EU ID Card, 3 = Aadhaar

export interface SelfProofData {
  proof: string;
  publicSignals: string[];
  attestationId: AttestationId;
  userContextData: string;
}

export interface VerificationMetrics {
  totalVerifications: number;
  successfulVerifications: number;
  failedVerifications: number;
  averageVerificationTime: number;
  lastVerificationTime: number;
}

// Error codes
export enum VerificationErrorCode {
  INVALID_PROOF = 'INVALID_PROOF',
  CONTRACT_ERROR = 'CONTRACT_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// HTTP status codes
export enum HttpStatusCode {
  OK = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  RATE_LIMIT_EXCEEDED = 429,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503
}
