import dotenv from 'dotenv';
import { AppConfig, VerificationConfig, ContractConfig } from '../types/verification.types';

// Load environment variables
dotenv.config();

export class ConfigService {
  private static instance: ConfigService;
  private config: AppConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  public getConfig(): AppConfig {
    return this.config;
  }

  public getVerificationConfig(): VerificationConfig {
    return this.config.verification;
  }

  public getContractConfig(): ContractConfig {
    return this.config.contract;
  }

  private loadConfig(): AppConfig {
    const nodeEnv = process.env.NODE_ENV || 'development';
    
    return {
      port: parseInt(process.env.PORT || '3000', 10),
      nodeEnv,
      verification: this.loadVerificationConfig(),
      contract: this.loadContractConfig(),
      logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: process.env.LOG_FILE || 'logs/app.log'
      }
    };
  }

  private loadVerificationConfig(): VerificationConfig {
    const excludedCountries = process.env.EXCLUDED_COUNTRIES 
      ? process.env.EXCLUDED_COUNTRIES.split(',')
      : ['IRN', 'PRK', 'RUS', 'SYR'];

    return {
      selfAppName: process.env.SELF_APP_NAME || 'merchant-cds',
      selfScope: process.env.SELF_SCOPE || 'merchant-verification',
      selfEndpoint: process.env.SELF_ENDPOINT || 'https://api.self.xyz/verify',
      minimumAge: parseInt(process.env.MINIMUM_AGE || '18', 10),
      excludedCountries,
      ofac: process.env.OFAC_ENABLED === 'true',
      mockPassport: process.env.NODE_ENV === 'development' || process.env.MOCK_PASSPORT === 'true'
    };
  }

  private loadContractConfig(): ContractConfig {
    const requiredEnvVars = [
      'CELO_RPC_URL',
      'CONTRACT_ADDRESS',
      'PRIVATE_KEY'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    return {
      celoRpcUrl: process.env.CELO_RPC_URL!,
      contractAddress: process.env.CONTRACT_ADDRESS!,
      privateKey: process.env.PRIVATE_KEY!,
      chainId: parseInt(process.env.CELO_CHAIN_ID || '42220', 10) // Mainnet: 42220, Testnet: 44787
    };
  }

  public validateConfig(): void {
    const config = this.config;
    
    // Validate verification config
    if (!config.verification.selfAppName) {
      throw new Error('SELF_APP_NAME is required');
    }
    
    if (!config.verification.selfEndpoint) {
      throw new Error('SELF_ENDPOINT is required');
    }
    
    if (config.verification.minimumAge < 0 || config.verification.minimumAge > 120) {
      throw new Error('MINIMUM_AGE must be between 0 and 120');
    }

    // Validate contract config
    if (!config.contract.celoRpcUrl.startsWith('http')) {
      throw new Error('CELO_RPC_URL must be a valid HTTP URL');
    }
    
    if (!config.contract.contractAddress.startsWith('0x')) {
      throw new Error('CONTRACT_ADDRESS must be a valid Ethereum address');
    }
    
    if (!config.contract.privateKey.startsWith('0x')) {
      throw new Error('PRIVATE_KEY must be a valid private key');
    }

    // Validate port
    if (config.port < 1 || config.port > 65535) {
      throw new Error('PORT must be between 1 and 65535');
    }
  }

  public isDevelopment(): boolean {
    return this.config.nodeEnv === 'development';
  }

  public isProduction(): boolean {
    return this.config.nodeEnv === 'production';
  }

  public isTest(): boolean {
    return this.config.nodeEnv === 'test';
  }
}
