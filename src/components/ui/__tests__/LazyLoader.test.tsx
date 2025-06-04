import React, { lazy } from 'react';
import { render, screen, waitFor } from '../../../test/test-utils';
import { LazyLoader, SkeletonLoader, LazyImage, createLazyComponent } from '../LazyLoader';
import { vi } from 'vitest';

// Mock performance hook
vi.mock('../../hooks/usePerformance', () => ({
  usePerformance: () => ({
    measureRenderTime: vi.fn(() => vi.fn()),
  }),
}));

describe('LazyLoader', () => {
  it('renders loading fallback initially', () => {
    const TestComponent = () => <div data-testid="test-component">Test Content</div>;
    
    render(
      <LazyLoader componentName="TestComponent">
        <TestComponent />
      </LazyLoader>
    );

    expect(screen.getByText('Loading TestComponent')).toBeInTheDocument();
  });

  it('renders children after loading', async () => {
    const TestComponent = () => <div data-testid="test-component">Test Content</div>;
    
    render(
      <LazyLoader componentName="TestComponent">
        <TestComponent />
      </LazyLoader>
    );

    await waitFor(() => {
      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });
  });

  it('uses custom fallback when provided', () => {
    const TestComponent = () => <div data-testid="test-component">Test Content</div>;
    const CustomFallback = () => <div data-testid="custom-fallback">Custom Loading</div>;
    
    render(
      <LazyLoader componentName="TestComponent" fallback={<CustomFallback />}>
        <TestComponent />
      </LazyLoader>
    );

    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
  });
});

describe('SkeletonLoader', () => {
  it('renders card skeleton by default', () => {
    render(<SkeletonLoader />);
    
    const skeleton = screen.getByText(''); // The skeleton div
    expect(skeleton.parentElement).toHaveClass('p-6', 'bg-gray-800', 'rounded-lg');
  });

  it('renders table skeleton when type is table', () => {
    render(<SkeletonLoader type="table" />);
    
    const skeletons = screen.getAllByText('');
    expect(skeletons.length).toBeGreaterThan(1); // Multiple table rows
  });

  it('renders chart skeleton when type is chart', () => {
    render(<SkeletonLoader type="chart" />);
    
    const skeleton = screen.getByText('');
    expect(skeleton.parentElement).toHaveClass('p-6', 'bg-gray-800', 'rounded-lg');
  });

  it('renders text skeleton when type is text', () => {
    render(<SkeletonLoader type="text" />);
    
    const skeletons = screen.getAllByText('');
    expect(skeletons.length).toBe(4); // 4 text lines
  });
});

describe('LazyImage', () => {
  beforeEach(() => {
    // Mock IntersectionObserver
    const mockIntersectionObserver = vi.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn()
    });
    window.IntersectionObserver = mockIntersectionObserver;
  });

  it('renders placeholder initially', () => {
    render(<LazyImage src="test.jpg" alt="Test Image" />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders custom placeholder when provided', () => {
    render(<LazyImage src="test.jpg" alt="Test Image" placeholder="placeholder.jpg" />);
    
    const placeholder = screen.getByRole('img', { hidden: true });
    expect(placeholder).toHaveAttribute('src', 'placeholder.jpg');
  });

  it('applies custom className', () => {
    render(<LazyImage src="test.jpg" alt="Test Image" className="custom-class" />);
    
    const container = screen.getByText('Loading...').parentElement;
    expect(container).toHaveClass('custom-class');
  });
});

describe('createLazyComponent', () => {
  it('creates a lazy component that renders correctly', async () => {
    const TestComponent = () => <div data-testid="lazy-test">Lazy Component</div>;
    
    const LazyTestComponent = createLazyComponent({
      loader: () => Promise.resolve({ default: TestComponent }),
      componentName: 'LazyTestComponent'
    });

    render(<LazyTestComponent />);

    // Should show loading initially
    expect(screen.getByText('Loading LazyTestComponent')).toBeInTheDocument();

    // Should show component after loading
    await waitFor(() => {
      expect(screen.getByTestId('lazy-test')).toBeInTheDocument();
    });
  });

  it('uses custom fallback in lazy component', () => {
    const TestComponent = () => <div data-testid="lazy-test">Lazy Component</div>;
    const CustomFallback = () => <div data-testid="custom-lazy-fallback">Custom Lazy Loading</div>;
    
    const LazyTestComponent = createLazyComponent({
      loader: () => Promise.resolve({ default: TestComponent }),
      componentName: 'LazyTestComponent',
      fallback: <CustomFallback />
    });

    render(<LazyTestComponent />);

    expect(screen.getByTestId('custom-lazy-fallback')).toBeInTheDocument();
  });
}); 