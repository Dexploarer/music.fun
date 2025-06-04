import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../contexts/AuthContext';
import { AIProvider } from '../contexts/AIContext';
import { vi } from 'vitest';

// Mock user data for testing
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  role: 'admin' as const,
  first_name: 'Test',
  last_name: 'User',
  avatar_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Mock auth context
export const mockAuthContext = {
  user: mockUser,
  session: {
    access_token: 'mock-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    expires_at: Date.now() + 3600000,
    token_type: 'Bearer',
    user: mockUser,
  },
  isLoading: false,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  resetPassword: vi.fn(),
  updateProfile: vi.fn(),
  hasRole: vi.fn(() => true),
  can: vi.fn(() => true),
};

// Mock AI context
export const mockAIContext = {
  isAIEnabled: true,
  generateText: vi.fn(() => Promise.resolve('Generated text')),
  generateImage: vi.fn(() => Promise.resolve('https://example.com/image.jpg')),
  analyzeData: vi.fn(() => Promise.resolve({ insights: ['Test insight'] })),
  isLoading: false,
  error: null,
};

// Create a test query client
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
    },
    mutations: {
      retry: false,
    },
  },
});

// Custom render function with all providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
  user?: typeof mockUser | null;
  queryClient?: QueryClient;
}

const AllTheProviders: React.FC<{
  children: React.ReactNode;
  initialEntries?: string[];
  user?: typeof mockUser | null;
  queryClient?: QueryClient;
}> = ({ children, initialEntries = ['/'], user = mockUser, queryClient }) => {
  const testQueryClient = queryClient || createTestQueryClient();

  // Create a mock auth context value for testing
  const authContextValue = user 
    ? { ...mockAuthContext, user } 
    : { ...mockAuthContext, user: null, session: null };

  return (
    <QueryClientProvider client={testQueryClient}>
      <BrowserRouter>
        <div data-testid="mock-auth-provider" data-user={user?.id || 'null'}>
          <div data-testid="mock-ai-provider">
            {children}
          </div>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: CustomRenderOptions
) => {
  const { initialEntries, user, queryClient, ...renderOptions } = options || {};

  return render(ui, {
    wrapper: (props) => (
      <AllTheProviders 
        {...props} 
        initialEntries={initialEntries}
        user={user}
        queryClient={queryClient}
      />
    ),
    ...renderOptions,
  });
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Helper functions for testing
export const waitForLoadingToFinish = () => 
  new Promise(resolve => setTimeout(resolve, 0));

export const mockSupabaseResponse = <T,>(data: T) => ({
  data,
  error: null,
  status: 200,
  statusText: 'OK',
});

export const mockSupabaseError = (message: string) => ({
  data: null,
  error: { message, details: '', hint: '', code: '' },
  status: 400,
  statusText: 'Bad Request',
});

// Mock data generators
export const generateMockArtist = (overrides?: Partial<Record<string, any>>) => ({
  id: 'artist-' + Math.random().toString(36).substr(2, 9),
  name: 'Test Artist',
  email: 'artist@example.com',
  phone: '+1234567890',
  genre: 'Rock',
  bio: 'Test artist bio',
  social_media: {
    instagram: '@testartist',
    facebook: 'testartist',
    twitter: '@testartist',
  },
  booking_rate: 5000,
  performance_history: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const generateMockEvent = (overrides?: Partial<Record<string, any>>) => ({
  id: 'event-' + Math.random().toString(36).substr(2, 9),
  title: 'Test Event',
  description: 'Test event description',
  date: new Date().toISOString(),
  start_time: '20:00',
  end_time: '23:00',
  venue: 'The Train Station',
  artist_id: 'test-artist-id',
  ticket_price: 25,
  capacity: 200,
  tickets_sold: 50,
  status: 'scheduled',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const generateMockCustomer = (overrides?: Partial<Record<string, any>>) => ({
  id: 'customer-' + Math.random().toString(36).substr(2, 9),
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  date_of_birth: '1990-01-01',
  total_spent: 150.00,
  loyalty_points: 1500,
  membership_tier: 'silver',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const generateMockInventoryItem = (overrides?: Partial<Record<string, any>>) => ({
  id: 'item-' + Math.random().toString(36).substr(2, 9),
  name: 'Test Item',
  category: 'Beverage',
  sku: 'TEST-001',
  quantity: 100,
  unit_price: 5.99,
  cost_price: 3.50,
  reorder_level: 20,
  supplier: 'Test Supplier',
  expiry_date: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const generateMockProject = (overrides?: Partial<Record<string, any>>) => ({
  id: 'project-' + Math.random().toString(36).substr(2, 9),
  title: 'Test Project',
  description: 'Test project description',
  status: 'in_progress',
  priority: 'medium',
  assigned_to: 'test-user-id',
  due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  progress: 50,
  budget: 5000,
  spent: 2500,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

// Performance testing helpers
export const measureRenderTime = (renderFn: () => void): number => {
  const start = performance.now();
  renderFn();
  const end = performance.now();
  return end - start;
};

export const expectFastRender = (renderTime: number, threshold: number = 100) => {
  expect(renderTime).toBeLessThan(threshold);
};

// Accessibility testing helpers
export const checkAccessibility = async (container: HTMLElement) => {
  // Basic accessibility checks
  const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const images = container.querySelectorAll('img');
  const links = container.querySelectorAll('a');
  const buttons = container.querySelectorAll('button');
  const inputs = container.querySelectorAll('input');

  // Check for alt text on images
  images.forEach(img => {
    expect(img.getAttribute('alt')).toBeTruthy();
  });

  // Check for accessible link text
  links.forEach(link => {
    const text = link.textContent?.trim();
    if (text) {
      expect(text.length).toBeGreaterThan(0);
      expect(text).not.toBe('click here');
      expect(text).not.toBe('read more');
    }
  });

  // Check for button accessibility
  buttons.forEach(button => {
    const hasText = button.textContent?.trim();
    const hasAriaLabel = button.getAttribute('aria-label');
    const hasAriaLabelledBy = button.getAttribute('aria-labelledby');
    
    expect(hasText || hasAriaLabel || hasAriaLabelledBy).toBeTruthy();
  });

  // Check for form input labels
  inputs.forEach(input => {
    const id = input.getAttribute('id');
    const hasLabel = id && container.querySelector(`label[for="${id}"]`);
    const hasAriaLabel = input.getAttribute('aria-label');
    const hasAriaLabelledBy = input.getAttribute('aria-labelledby');
    
    expect(hasLabel || hasAriaLabel || hasAriaLabelledBy).toBeTruthy();
  });
};

// Network request mocking helpers
export const mockApiCall = (endpoint: string, response: any, status: number = 200) => {
  (global.fetch as any).mockImplementationOnce(() =>
    Promise.resolve({
      ok: status < 400,
      status,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
      headers: new Headers({ 'content-type': 'application/json' }),
    })
  );
};

export const mockApiError = (endpoint: string, status: number = 500, message: string = 'Internal Server Error') => {
  (global.fetch as any).mockImplementationOnce(() =>
    Promise.resolve({
      ok: false,
      status,
      json: () => Promise.resolve({ error: message }),
      text: () => Promise.resolve(JSON.stringify({ error: message })),
      headers: new Headers({ 'content-type': 'application/json' }),
    })
  );
}; 