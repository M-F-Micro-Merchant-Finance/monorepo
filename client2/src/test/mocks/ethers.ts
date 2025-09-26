// Mock ethers.js
export const mockEthers = {
  utils: {
    keccak256: jest.fn().mockReturnValue('0x1234567890abcdef1234567890abcdef12345678'),
    toUtf8Bytes: jest.fn().mockReturnValue(new Uint8Array([1, 2, 3, 4])),
    defaultAbiCoder: {
      encode: jest.fn().mockReturnValue('0xencodeddata'),
    },
  },
  constants: {
    AddressZero: '0x0000000000000000000000000000000000000000',
  },
};

jest.mock('ethers', () => mockEthers);