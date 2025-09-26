# Merchant Identity Verification Server

A Node.js backend service for merchant identity verification using Self Protocol integration with Celo blockchain smart contracts.

## Overview

This server provides privacy-preserving identity verification for merchants in the Celo DeFi ecosystem. It integrates with Self Protocol for zero-knowledge proof verification and interacts with smart contracts on the Celo network.

## Features

- **Self Protocol Integration**: Zero-knowledge proof verification without exposing personal data
- **Smart Contract Interaction**: Direct integration with Celo blockchain contracts
- **Privacy Preservation**: No storage of sensitive personal information
- **Comprehensive Testing**: Unit, integration, and end-to-end tests
- **Error Handling**: Robust error handling and logging
- **Rate Limiting**: Protection against abuse
- **Security**: Input validation and sanitization

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API    │    │  Self Protocol  │
│   (React)       │◄──►│   (Express)      │◄──►│   (ZK Proofs)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │  Celo Blockchain │
                       │  (Smart Contract)│
                       └──────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Celo wallet with testnet/mainnet access
- Self Protocol credentials

### Installation

1. Clone the repository and navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment configuration:
```bash
cp env.example .env
```

4. Configure environment variables (see Configuration section)

5. Build the project:
```bash
npm run build
```

6. Start the server:
```bash
npm start
```

For development:
```bash
npm run dev
```

## Configuration

### Environment Variables

Create a `.env` file with the following variables:

```bash
# Server Configuration
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

# Self Protocol Configuration
SELF_APP_NAME=merchant-cds
SELF_SCOPE=merchant-verification
SELF_ENDPOINT=https://api.self.xyz/verify
MINIMUM_AGE=18
EXCLUDED_COUNTRIES=IRN,PRK,RUS,SYR
OFAC_ENABLED=true
MOCK_PASSPORT=false

# Celo Network Configuration
CELO_RPC_URL=https://forno.celo.org
CELO_CHAIN_ID=42220
CONTRACT_ADDRESS=0x742d35Cc6634C0532925a3b8D
PRIVATE_KEY=0x1234567890abcdef...

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Configuration Validation

The server validates all configuration on startup. Missing or invalid configuration will prevent the server from starting.

## API Endpoints

### POST /api/verify/identity

Verifies merchant identity using Self Protocol proof.

**Request Body:**
```json
{
  "proof": "0x1234567890abcdef...",
  "publicSignals": ["0x1111...", "0x2222..."],
  "attestationId": 1,
  "userContextData": "0xabcdef1234567890...",
  "merchantAddress": "0x742d35Cc6634C0532925a3b8D"
}
```

**Response:**
```json
{
  "success": true,
  "transactionHash": "0x1234567890abcdef...",
  "verificationId": "verification_0x742d35_1234567890_abc123",
  "timestamp": 1234567890
}
```

### GET /api/verify/status/:merchantAddress

Checks verification status for a merchant.

**Response:**
```json
{
  "isVerified": true,
  "merchantAddress": "0x742d35Cc6634C0532925a3b8D",
  "verificationTimestamp": 1234567890
}
```

### GET /api/health

Returns detailed health status of the service.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "selfProtocol": "connected",
    "celoNetwork": "connected",
    "contract": "connected"
  },
  "network": {
    "chainId": 42220,
    "blockNumber": 12345678,
    "gasPrice": "1000000000"
  }
}
```

### GET /api/metrics

Returns verification metrics and statistics.

**Response:**
```json
{
  "success": true,
  "metrics": {
    "totalVerifications": 100,
    "successfulVerifications": 95,
    "failedVerifications": 5,
    "averageVerificationTime": 1500,
    "lastVerificationTime": 1234567890
  }
}
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test verification.service.test.ts
```

### Test Structure

- **Unit Tests**: Test individual service components
- **Integration Tests**: Test API endpoints and service interactions
- **E2E Tests**: Test complete verification flows

### Test Coverage

The test suite covers:
- Self Protocol integration
- Smart contract interactions
- Input validation
- Error handling
- API endpoints
- Configuration management

## Development

### Project Structure

```
server/
├── src/
│   ├── services/          # Business logic services
│   ├── controllers/       # API controllers
│   ├── middleware/        # Express middleware
│   ├── utils/            # Utility functions
│   ├── types/            # TypeScript type definitions
│   └── app.ts            # Express application
├── tests/
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── e2e/              # End-to-end tests
├── config/               # Configuration files
└── logs/                 # Log files (production)
```

### Code Quality

- **TypeScript**: Full type safety
- **ESLint**: Code linting and formatting
- **Jest**: Comprehensive testing
- **Winston**: Structured logging

### Adding New Features

1. Create service in `src/services/`
2. Add controller in `src/controllers/`
3. Add types in `src/types/`
4. Write tests in `tests/`
5. Update API documentation

## Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment-Specific Configuration

- **Development**: Uses mock Self Protocol for testing
- **Staging**: Uses Self Protocol staging environment
- **Production**: Uses Self Protocol production environment

### Health Checks

The server provides health check endpoints for monitoring:
- `/health` - Basic health status
- `/api/health` - Detailed health status with service checks

## Security

### Input Validation

- All inputs are validated using Joi schemas
- Ethereum addresses are validated for proper format
- Proof data is validated for required structure

### Rate Limiting

- 100 requests per 15 minutes per IP
- Configurable rate limits
- Graceful error responses

### Error Handling

- No sensitive data in error responses
- Structured error logging
- Proper HTTP status codes

## Monitoring

### Logging

- Structured JSON logging
- Different log levels (error, warn, info, debug)
- Request/response logging
- Error tracking

### Metrics

- Verification success/failure rates
- Average verification time
- Contract interaction metrics
- Error frequency tracking

## Troubleshooting

### Common Issues

1. **Configuration Errors**: Check environment variables
2. **Self Protocol Errors**: Verify credentials and endpoint
3. **Contract Errors**: Check Celo network connectivity
4. **Validation Errors**: Verify request format

### Debug Mode

Set `LOG_LEVEL=debug` for detailed logging.

### Support

For issues and questions:
1. Check the logs for error details
2. Verify configuration
3. Test with mock data first
4. Contact the development team

## License

MIT License - see LICENSE file for details.
