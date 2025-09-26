// Mock contract interactions
export const mockContractKit = {
  defaultAccount: '0x1234567890abcdef1234567890abcdef12345678',
  web3: {
    eth: {
      Contract: jest.fn().mockImplementation(() => ({
        methods: {
          onUserDataHook: jest.fn().mockReturnValue({
            send: jest.fn().mockResolvedValue({
              transactionHash: '0xabcdef1234567890',
              status: true,
            }),
          }),
          verifyMerchantIdentity: jest.fn().mockReturnValue({
            send: jest.fn().mockResolvedValue({
              transactionHash: '0x1234567890abcdef',
              status: true,
            }),
          }),
        },
      })),
    },
  },
};

jest.mock('@celo/contractkit', () => ({
  ContractKit: jest.fn().mockImplementation(() => mockContractKit),
}));
