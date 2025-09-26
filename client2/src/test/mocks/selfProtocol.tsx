// Mock Self Protocol modules
export const mockSelfApp = {
  version: 2,
  appName: 'Test App',
  scope: 'test-scope',
  endpoint: 'https://test.self.xyz/api/verify',
  userId: '0x1234567890abcdef',
  userDefinedData: 'test-data',
  disclosures: {
    minimumAge: 18,
    nationality: true,
    gender: false,
  },
};

export const mockSelfQRcodeWrapper = jest.fn().mockImplementation(({ onSuccess, onError }) => {
  // Simulate successful verification after a delay
  setTimeout(() => {
    onSuccess({
      isValid: true,
      credentialSubject: {
        nationality: 'US',
        age: 25,
      },
      attestationId: 1,
      proof: 'mock-proof',
      publicSignals: ['mock-signal'],
      userContextData: 'mock-context',
    });
  }, 100);
  
  return <div data-testid="qr-code">QR Code Component</div>;
});

export const mockSelfAppBuilder = jest.fn().mockImplementation(() => ({
  build: jest.fn().mockReturnValue(mockSelfApp),
}));

export const mockGetUniversalLink = jest.fn().mockReturnValue('https://test.self.xyz/verify?data=mock');

// Mock the actual modules
jest.mock('@selfxyz/qrcode', () => ({
  SelfQRcodeWrapper: mockSelfQRcodeWrapper,
  SelfAppBuilder: mockSelfAppBuilder,
}));

jest.mock('@selfxyz/core', () => ({
  getUniversalLink: mockGetUniversalLink,
}));
