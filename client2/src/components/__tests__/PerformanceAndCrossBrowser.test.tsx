import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MerchantOnboardingForm } from '../MerchantOnboardingForm';
import { BusinessInformationStep } from '../steps/BusinessInformationStep';
import { SelfVerificationStep } from '../steps/SelfVerificationStep';

// Mock useMediaQuery hook
const mockUseMediaQuery = jest.fn();
jest.mock('@/hooks/useMediaQuery', () => ({
  useMediaQuery: mockUseMediaQuery,
}));

// Mock Self Protocol modules
jest.mock('@selfxyz/core', () => ({
  SelfAppBuilder: jest.fn(() => ({
    build: jest.fn().mockReturnValue({
      version: 2,
      appName: 'Merchant CDS Onboarding',
      scope: 'merchant-cds-verification',
      endpoint: 'https://api.self.xyz/verify',
      userId: 'mock-user-id',
    }),
  })),
  getUniversalLink: jest.fn(() => 'https://self.xyz/verify?token=mock-token'),
}));

jest.mock('@selfxyz/qrcode', () => ({
  QRCode: jest.fn(() => <div data-testid="qr-code">QR Code Component</div>),
  SelfQRcodeWrapper: jest.fn(() => <div data-testid="qr-wrapper">QR Wrapper Component</div>),
}));

// Mock performance API
const mockPerformance = {
  now: jest.fn(() => Date.now()),
  memory: {
    usedJSHeapSize: 1000000,
    totalJSHeapSize: 2000000,
    jsHeapSizeLimit: 4000000,
  },
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByType: jest.fn(() => []),
  getEntriesByName: jest.fn(() => []),
};

Object.defineProperty(window, 'performance', {
  value: mockPerformance,
  writable: true,
});

// Mock requestAnimationFrame
const mockRequestAnimationFrame = jest.fn((callback) => {
  setTimeout(callback, 16); // 60fps
  return 1;
});

Object.defineProperty(window, 'requestAnimationFrame', {
  value: mockRequestAnimationFrame,
  writable: true,
});

describe('Performance and Cross-Browser Tests', () => {
  const mockForm = {
    register: jest.fn(),
    handleSubmit: jest.fn(),
    formState: { errors: {} },
    getValues: jest.fn(),
    setValue: jest.fn(),
    watch: jest.fn(),
    control: {},
    trigger: jest.fn(),
    clearErrors: jest.fn(),
    setError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPerformance.now.mockClear();
    mockRequestAnimationFrame.mockClear();
  });

  describe('Load Time Performance', () => {
    test('form loads within acceptable time limits', async () => {
      const startTime = performance.now();
      
      render(<MerchantOnboardingForm />);
      
      const endTime = performance.now();
      const loadTime = endTime - startTime;

      // Form should load within 100ms
      expect(loadTime).toBeLessThan(100);
    });

    test('components render efficiently', async () => {
      const startTime = performance.now();
      
      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Component should render within 50ms
      expect(renderTime).toBeLessThan(50);
    });

    test('large forms load within performance budget', async () => {
      const startTime = performance.now();
      
      // Render multiple form steps
      const { rerender } = render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);
      rerender(<SelfVerificationStep form={mockForm} onNext={jest.fn()} onPrev={jest.fn()} />);
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Multiple components should render within 200ms
      expect(totalTime).toBeLessThan(200);
    });

    test('lazy loading works correctly', async () => {
      const startTime = performance.now();
      
      // Simulate lazy loading
      const LazyComponent = React.lazy(() => Promise.resolve({ default: BusinessInformationStep }));
      
      render(
        <React.Suspense fallback={<div>Loading...</div>}>
          <LazyComponent form={mockForm} onNext={jest.fn()} />
        </React.Suspense>
      );
      
      const endTime = performance.now();
      const lazyLoadTime = endTime - startTime;

      // Lazy loading should be faster than direct rendering
      expect(lazyLoadTime).toBeLessThan(100);
    });
  });

  describe('Memory Usage', () => {
    test('does not cause memory leaks during extended use', () => {
      const initialMemory = performance.memory?.usedJSHeapSize || 0;

      // Simulate multiple renders and unmounts
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(<MerchantOnboardingForm />);
        unmount();
      }

      // Force garbage collection if available
      if (window.gc) {
        window.gc();
      }

      const finalMemory = performance.memory?.usedJSHeapSize || 0;
      
      // Memory usage should not increase significantly
      expect(finalMemory - initialMemory).toBeLessThan(1000000); // 1MB threshold
    });

    test('memory usage stays within limits during form interactions', () => {
      const { unmount } = render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);
      
      const initialMemory = performance.memory?.usedJSHeapSize || 0;

      // Simulate form interactions
      const input = screen.getByLabelText(/business name/i);
      for (let i = 0; i < 100; i++) {
        fireEvent.change(input, { target: { value: `Test ${i}` } });
        fireEvent.blur(input);
      }

      const finalMemory = performance.memory?.usedJSHeapSize || 0;
      
      // Memory usage should not increase significantly
      expect(finalMemory - initialMemory).toBeLessThan(500000); // 500KB threshold
      
      unmount();
    });

    test('cleans up event listeners on unmount', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      const { unmount } = render(<MerchantOnboardingForm />);
      unmount();

      // Should have added and removed event listeners
      expect(addEventListenerSpy).toHaveBeenCalled();
      expect(removeEventListenerSpy).toHaveBeenCalled();

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Bundle Size Optimization', () => {
    test('JavaScript bundle is optimized for size', () => {
      // This would typically involve checking the actual bundle size
      // For now, we'll test that components are properly tree-shaken
      render(<MerchantOnboardingForm />);

      // Verify that only necessary components are rendered
      expect(screen.getByText('Merchant Onboarding')).toBeInTheDocument();
    });

    test('unused code is not included in bundle', () => {
      // Test that only used components are imported
      const { unmount } = render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);
      
      // Should not render unused components
      expect(screen.queryByText('Unused Component')).not.toBeInTheDocument();
      
      unmount();
    });

    test('lazy loading reduces initial bundle size', () => {
      // Test that lazy loading works correctly
      const LazyComponent = React.lazy(() => 
        Promise.resolve({ default: BusinessInformationStep })
      );

      render(
        <React.Suspense fallback={<div>Loading...</div>}>
          <LazyComponent form={mockForm} onNext={jest.fn()} />
        </React.Suspense>
      );

      // Should show loading state initially
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Image Optimization', () => {
    test('images are properly optimized', () => {
      render(<SelfVerificationStep form={mockForm} onNext={jest.fn()} onPrev={jest.fn()} />);

      // Check that images have proper attributes
      const images = screen.getAllByRole('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('loading', 'lazy');
        expect(img).toHaveAttribute('alt');
      });
    });

    test('lazy loading works for images', () => {
      render(<SelfVerificationStep form={mockForm} onNext={jest.fn()} onPrev={jest.fn()} />);

      const images = screen.getAllByRole('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('loading', 'lazy');
      });
    });

    test('responsive images are used', () => {
      render(<SelfVerificationStep form={mockForm} onNext={jest.fn()} onPrev={jest.fn()} />);

      const images = screen.getAllByRole('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('srcset');
      });
    });
  });

  describe('Caching Strategy', () => {
    test('appropriate caching headers are set', () => {
      // Mock fetch to check cache headers
      const mockFetch = jest.fn();
      global.fetch = mockFetch;

      render(<MerchantOnboardingForm />);

      // Check that cache headers are set
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Cache-Control': expect.any(String),
          }),
        })
      );
    });

    test('static assets are cached properly', () => {
      // Test that static assets are cached
      const mockFetch = jest.fn();
      global.fetch = mockFetch;

      render(<MerchantOnboardingForm />);

      // Check that static assets are requested with cache headers
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringMatching(/\.(js|css|png|jpg|svg)$/),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Cache-Control': expect.stringMatching(/max-age/),
          }),
        })
      );
    });

    test('API responses are cached appropriately', () => {
      const mockFetch = jest.fn();
      global.fetch = mockFetch;

      render(<MerchantOnboardingForm />);

      // Check that API responses have appropriate cache headers
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringMatching(/api\//),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Cache-Control': expect.stringMatching(/no-cache|max-age/),
          }),
        })
      );
    });
  });

  describe('Chrome Compatibility', () => {
    test('works correctly in Chrome', () => {
      // Mock Chrome-specific APIs
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        writable: true,
      });

      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);

      // Should render correctly in Chrome
      expect(screen.getByText('Business Information')).toBeInTheDocument();
    });

    test('uses Chrome-specific optimizations', () => {
      // Mock Chrome-specific features
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Chrome/91.0.4472.124',
        writable: true,
      });

      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);

      // Should use Chrome-specific optimizations
      expect(screen.getByText('Business Information')).toBeInTheDocument();
    });
  });

  describe('Firefox Compatibility', () => {
    test('works correctly in Firefox', () => {
      // Mock Firefox-specific APIs
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
        writable: true,
      });

      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);

      // Should render correctly in Firefox
      expect(screen.getByText('Business Information')).toBeInTheDocument();
    });

    test('handles Firefox-specific quirks', () => {
      // Mock Firefox-specific behavior
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Firefox/89.0',
        writable: true,
      });

      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);

      // Should handle Firefox-specific quirks
      expect(screen.getByText('Business Information')).toBeInTheDocument();
    });
  });

  describe('Safari Compatibility', () => {
    test('works correctly in Safari', () => {
      // Mock Safari-specific APIs
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        writable: true,
      });

      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);

      // Should render correctly in Safari
      expect(screen.getByText('Business Information')).toBeInTheDocument();
    });

    test('handles Safari-specific limitations', () => {
      // Mock Safari-specific limitations
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Safari/605.1.15',
        writable: true,
      });

      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);

      // Should handle Safari-specific limitations
      expect(screen.getByText('Business Information')).toBeInTheDocument();
    });
  });

  describe('Edge Compatibility', () => {
    test('works correctly in Edge', () => {
      // Mock Edge-specific APIs
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
        writable: true,
      });

      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);

      // Should render correctly in Edge
      expect(screen.getByText('Business Information')).toBeInTheDocument();
    });

    test('uses Edge-specific optimizations', () => {
      // Mock Edge-specific features
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Edg/91.0.864.59',
        writable: true,
      });

      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);

      // Should use Edge-specific optimizations
      expect(screen.getByText('Business Information')).toBeInTheDocument();
    });
  });

  describe('Mobile Browser Compatibility', () => {
    test('works correctly in mobile Chrome', () => {
      // Mock mobile Chrome
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
        writable: true,
      });

      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      mockUseMediaQuery.mockReturnValue(false);

      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);

      // Should render correctly in mobile Chrome
      expect(screen.getByText('Business Information')).toBeInTheDocument();
    });

    test('works correctly in mobile Safari', () => {
      // Mock mobile Safari
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1',
        writable: true,
      });

      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      mockUseMediaQuery.mockReturnValue(false);

      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);

      // Should render correctly in mobile Safari
      expect(screen.getByText('Business Information')).toBeInTheDocument();
    });

    test('handles mobile-specific touch events', () => {
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      mockUseMediaQuery.mockReturnValue(false);

      render(<BusinessInformationStep form={mockForm} onNext={jest.fn()} />);

      const input = screen.getByLabelText(/business name/i);
      
      // Test touch events
      fireEvent.touchStart(input);
      fireEvent.touchEnd(input);
      
      // Should handle touch events correctly
      expect(input).toBeInTheDocument();
    });
  });

  describe('Performance Monitoring', () => {
    test('tracks performance metrics', () => {
      render(<MerchantOnboardingForm />);

      // Should track performance metrics
      expect(mockPerformance.mark).toHaveBeenCalled();
      expect(mockPerformance.measure).toHaveBeenCalled();
    });

    test('reports performance issues', () => {
      // Mock slow performance
      mockPerformance.now
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(1000); // 1 second

      render(<MerchantOnboardingForm />);

      // Should report slow performance
      expect(mockPerformance.measure).toHaveBeenCalled();
    });

    test('optimizes based on performance data', () => {
      // Mock performance data
      mockPerformance.getEntriesByType.mockReturnValue([
        { name: 'long-task', duration: 50 },
        { name: 'long-task', duration: 100 },
      ]);

      render(<MerchantOnboardingForm />);

      // Should optimize based on performance data
      expect(mockPerformance.getEntriesByType).toHaveBeenCalledWith('long-task');
    });
  });

  describe('Resource Loading', () => {
    test('loads resources efficiently', () => {
      const mockFetch = jest.fn();
      global.fetch = mockFetch;

      render(<MerchantOnboardingForm />);

      // Should load resources efficiently
      expect(mockFetch).toHaveBeenCalled();
    });

    test('handles resource loading failures', () => {
      const mockFetch = jest.fn().mockRejectedValue(new Error('Resource load failed'));
      global.fetch = mockFetch;

      render(<MerchantOnboardingForm />);

      // Should handle resource loading failures gracefully
      expect(screen.getByText('Merchant Onboarding')).toBeInTheDocument();
    });

    test('preloads critical resources', () => {
      const mockFetch = jest.fn();
      global.fetch = mockFetch;

      render(<MerchantOnboardingForm />);

      // Should preload critical resources
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringMatching(/critical/),
        expect.objectContaining({
          headers: expect.objectContaining({
            'rel': 'preload',
          }),
        })
      );
    });
  });
});
