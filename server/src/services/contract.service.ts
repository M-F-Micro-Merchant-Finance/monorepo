import { ethers } from 'ethers';
import { ConfigService } from './config.service';
import { Logger } from '../utils/logger';
import { 
  ContractInteractionResult, 
  VerificationError, 
  VerificationErrorCode 
} from '../types/verification.types';

// Import the contract ABI - this would typically be generated from the contract
const MERCHANT_IDENTITY_VERIFICATION_ABI = [
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "proofPayload",
        "type": "bytes"
      },
      {
        "internalType": "bytes",
        "name": "userContextData",
        "type": "bytes"
      }
    ],
    "name": "verifyMerchantIdentity",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_merchant",
        "type": "address"
      }
    ],
    "name": "isVerifiedMerchant",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_minAgeRequirement",
        "type": "uint256"
      }
    ],
    "name": "setMinAgeRequirement",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "merchant",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "documentType",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "nullifier",
        "type": "uint256"
      }
    ],
    "name": "MerchantVerified",
    "type": "event"
  }
];

export class ContractService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;
  private config: ConfigService;
  private logger: Logger;

  constructor() {
    this.config = ConfigService.getInstance();
    this.logger = Logger.getInstance();
    this.initializeProvider();
    this.initializeWallet();
    this.initializeContract();
  }

  private initializeProvider(): void {
    const contractConfig = this.config.getContractConfig();
    
    try {
      this.provider = new ethers.JsonRpcProvider(contractConfig.celoRpcUrl);
      this.logger.info('Celo provider initialized', {
        rpcUrl: contractConfig.celoRpcUrl,
        chainId: contractConfig.chainId
      });
    } catch (error) {
      this.logger.error('Failed to initialize Celo provider', error);
      throw new VerificationError(
        'Failed to initialize Celo provider',
        VerificationErrorCode.NETWORK_ERROR,
        500,
        { originalError: error }
      );
    }
  }

  private initializeWallet(): void {
    const contractConfig = this.config.getContractConfig();
    
    try {
      this.wallet = new ethers.Wallet(contractConfig.privateKey, this.provider);
      this.logger.info('Wallet initialized', {
        address: this.wallet.address
      });
    } catch (error) {
      this.logger.error('Failed to initialize wallet', error);
      throw new VerificationError(
        'Failed to initialize wallet',
        VerificationErrorCode.CONFIGURATION_ERROR,
        500,
        { originalError: error }
      );
    }
  }

  private initializeContract(): void {
    const contractConfig = this.config.getContractConfig();
    
    try {
      this.contract = new ethers.Contract(
        contractConfig.contractAddress,
        MERCHANT_IDENTITY_VERIFICATION_ABI,
        this.wallet
      );
      
      this.logger.info('Contract initialized', {
        address: contractConfig.contractAddress
      });
    } catch (error) {
      this.logger.error('Failed to initialize contract', error);
      throw new VerificationError(
        'Failed to initialize contract',
        VerificationErrorCode.CONFIGURATION_ERROR,
        500,
        { originalError: error }
      );
    }
  }

  public async verifyMerchantIdentity(
    proofPayload: string, 
    userContextData: string
  ): Promise<ContractInteractionResult> {
    try {
      this.logger.info('Calling verifyMerchantIdentity on contract', {
        proofPayloadLength: proofPayload.length,
        userContextDataLength: userContextData.length
      });

      // Convert hex strings to bytes
      const proofBytes = ethers.getBytes(proofPayload);
      const contextBytes = ethers.getBytes(userContextData);

      // Estimate gas first
      const gasEstimate = await this.contract.verifyMerchantIdentity.estimateGas(
        proofBytes,
        contextBytes
      );

      // Add 20% buffer to gas estimate
      const gasLimit = gasEstimate * 120n / 100n;

      // Send transaction
      const tx = await this.contract.verifyMerchantIdentity(
        proofBytes,
        contextBytes,
        {
          gasLimit
        }
      );

      this.logger.info('Transaction sent', {
        hash: tx.hash,
        gasLimit: gasLimit.toString()
      });

      // Wait for transaction to be mined
      const receipt = await tx.wait();

      this.logger.logContractInteraction(
        'verifyMerchantIdentity',
        receipt.hash,
        Number(receipt.gasUsed)
      );

      return {
        success: true,
        transactionHash: receipt.hash,
        gasUsed: Number(receipt.gasUsed)
      };

    } catch (error) {
      this.logger.logContractError('verifyMerchantIdentity', error instanceof Error ? error.message : 'Unknown error');
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Contract interaction failed'
      };
    }
  }

  public async isVerifiedMerchant(merchantAddress: string): Promise<boolean> {
    try {
      this.logger.debug('Checking if merchant is verified', { merchantAddress });

      const isVerified = await this.contract.isVerifiedMerchant(merchantAddress);
      
      this.logger.debug('Merchant verification status retrieved', {
        merchantAddress,
        isVerified
      });

      return isVerified;

    } catch (error) {
      this.logger.error('Failed to check merchant verification status', error, { merchantAddress });
      throw new VerificationError(
        'Failed to check merchant verification status',
        VerificationErrorCode.CONTRACT_ERROR,
        500,
        { originalError: error }
      );
    }
  }

  public async setMinAgeRequirement(minAge: number): Promise<ContractInteractionResult> {
    try {
      this.logger.info('Setting minimum age requirement', { minAge });

      const tx = await this.contract.setMinAgeRequirement(minAge);
      const receipt = await tx.wait();

      this.logger.logContractInteraction(
        'setMinAgeRequirement',
        receipt.hash,
        Number(receipt.gasUsed)
      );

      return {
        success: true,
        transactionHash: receipt.hash,
        gasUsed: Number(receipt.gasUsed)
      };

    } catch (error) {
      this.logger.logContractError('setMinAgeRequirement', error instanceof Error ? error.message : 'Unknown error');
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to set minimum age requirement'
      };
    }
  }

  public async getNetworkInfo(): Promise<{ chainId: number; blockNumber: number }> {
    try {
      const [chainId, blockNumber] = await Promise.all([
        this.provider.getNetwork().then(network => Number(network.chainId)),
        this.provider.getBlockNumber()
      ]);

      return { chainId, blockNumber };

    } catch (error) {
      this.logger.error('Failed to get network info', error);
      throw new VerificationError(
        'Failed to get network info',
        VerificationErrorCode.NETWORK_ERROR,
        500,
        { originalError: error }
      );
    }
  }

  public async getGasPrice(): Promise<bigint> {
    try {
      const feeData = await this.provider.getFeeData();
      return feeData.gasPrice || 0n;
    } catch (error) {
      this.logger.error('Failed to get gas price', error);
      throw new VerificationError(
        'Failed to get gas price',
        VerificationErrorCode.NETWORK_ERROR,
        500,
        { originalError: error }
      );
    }
  }

  public getContractAddress(): string {
    return this.config.getContractConfig().contractAddress;
  }

  public getWalletAddress(): string {
    return this.wallet.address;
  }
}
