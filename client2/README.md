# Merchant CDS Frontend

A Next.js frontend application for merchant onboarding with Self Protocol integration for the Credit Default Swap (CDS) system on Celo.

## Features

- **Privacy-Preserving Identity Verification**: Integration with Self Protocol for zero-knowledge identity verification
- **Comprehensive Merchant Onboarding**: Multi-step form for collecting business and financial information
- **Mobile-First Design**: Optimized for mobile devices and Celo's mobile ecosystem
- **Smart Contract Integration**: Direct integration with Celo smart contracts
- **Country Support**: Integration with Self Protocol supported countries
- **Real-time Validation**: Client-side and server-side data validation

## Tech Stack

- **Framework**: Next.js 14 with React 18
- **Styling**: Tailwind CSS with Headless UI components
- **Forms**: React Hook Form with Zod validation
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Self Protocol**: @selfxyz/qrcode and @selfxyz/core
- **Celo Integration**: @celo/contractkit
- **TypeScript**: Full TypeScript support

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or bun
- Celo wallet (Valora, Opera MiniPay, etc.)

### Installation

1. Clone the repository and navigate to the client directory:
```bash
cd client2
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
bun install
```

3. Copy the environment configuration:
```bash
cp env.example .env.local
```

4. Update the environment variables in `.env.local`:
   - Set your Self Protocol configuration
   - Update contract addresses with deployed addresses
   - Configure Celo RPC endpoints

5. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
bun dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── components/           # React components
│   ├── steps/           # Multi-step form components
│   ├── CountrySelection.tsx
│   └── MerchantOnboardingForm.tsx
├── pages/               # Next.js pages
│   └── api/            # API routes
├── types/               # TypeScript type definitions
│   └── contracts.ts    # Contract-related types
├── utils/               # Utility functions
├── hooks/               # Custom React hooks
└── styles/              # Global styles
```

## Key Components

### MerchantOnboardingForm
The main form component that orchestrates the multi-step onboarding process:
1. Business Information
2. Financial Information  
3. Identity Verification (Self Protocol)
4. Review & Submit

### SelfVerificationStep
Handles Self Protocol integration:
- QR code generation for desktop users
- Deep linking for mobile users
- Privacy-preserving identity verification
- Sybil resistance through passport verification

### CountrySelection
Provides country selection with Self Protocol supported countries:
- Searchable dropdown
- Mobile-optimized interface
- Integration with Self Protocol requirements

## Self Protocol Integration

The application integrates with Self Protocol for privacy-preserving identity verification:

### Frontend Configuration
```typescript
const selfApp = new SelfAppBuilder({
  version: 2,
  appName: "Merchant CDS Onboarding",
  scope: "merchant-cds-verification",
  endpoint: "https://api.self.xyz/api/verify",
  userId: userId,
  disclosures: {
    minimumAge: 18,
    nationality: true,
    excludedCountries: ["IRN", "PRK", "RUS", "SYR"],
    ofac: true
  }
}).build();
```

### Backend Verification
The `/api/verify` route handles proof verification using the Self Protocol backend SDK.

## Data Flow

1. **Merchant Data Collection**: User fills out comprehensive business and financial information
2. **Self Protocol Verification**: Identity verification using zero-knowledge proofs
3. **Data Processing**: Form data is processed and validated
4. **Smart Contract Integration**: Data is submitted to Celo smart contracts
5. **CDS Token Creation**: CDS tokens are created based on merchant data and risk assessment

## Mobile Optimization

The application is optimized for mobile devices:
- Mobile-first responsive design
- Touch-friendly interfaces
- Deep linking for Self Protocol integration
- Optimized for Celo's mobile ecosystem

## Country Support

The application supports countries that are compatible with Self Protocol:
- United States, Canada, United Kingdom
- European Union countries
- Asia-Pacific countries
- African countries
- Latin American countries

## Security Considerations

- **Data Privacy**: No sensitive data stored on frontend
- **Self Protocol**: Handles identity verification with zero-knowledge proofs
- **Input Validation**: Comprehensive client and server-side validation
- **Error Handling**: Graceful error handling and user feedback

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Code Quality

- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- React Hook Form for form management
- Zod for schema validation

## Deployment

### Environment Variables

Ensure all required environment variables are set:
- Self Protocol configuration
- Celo network endpoints
- Contract addresses
- API endpoints

### Build Process

```bash
npm run build
npm run start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions:
- Check the documentation
- Open an issue on GitHub
- Join the community Discord

## Related Projects

- [Self Protocol](https://self.xyz) - Privacy-preserving identity verification
- [Celo](https://celo.org) - Mobile-first blockchain platform
- [Merchant CDS Smart Contracts](../src/) - Solidity contracts for CDS system
