# Testing Suite - Train Station Dashboard

## Overview

This document outlines the comprehensive testing strategy and implementation for the Train Station Dashboard. Our testing approach ensures code quality, reliability, and maintainability across all system components.

## Testing Stack

### Core Testing Tools
- **Vitest** - Fast unit test runner with native ESM support
- **React Testing Library** - Component testing with user-centric approach
- **MSW (Mock Service Worker)** - API mocking for realistic testing
- **@testing-library/jest-dom** - Custom DOM matchers
- **@testing-library/user-event** - Realistic user interaction simulation

### Coverage & Reporting
- **@vitest/coverage-v8** - Code coverage analysis
- **@vitest/ui** - Interactive test runner interface
- **jsdom** - DOM environment for component testing

## Project Structure

```
src/
├── test/
│   ├── setup.ts                 # Global test configuration
│   ├── utils/                   # Test utilities and helpers
│   ├── mocks/                   # Global mocks and fixtures
│   └── README.md               # This documentation
├── lib/api/services/__tests__/  # Service layer tests
├── hooks/__tests__/             # Custom hooks tests
├── components/__tests__/        # Component tests
└── pages/__tests__/             # Page-level integration tests
```

## Testing Strategy

### 1. Service Layer Testing (90% Coverage Target)

**Focus Areas:**
- API request/response handling
- Error handling and transformation
- Business logic validation
- Data transformation and serialization

**Test Patterns:**
```typescript
// Service test example
describe('artistService', () => {
  it('should handle successful API responses', async () => {
    mockSupabaseClient.from().then.mockResolvedValueOnce({
      data: mockArtists,
      error: null,
    });

    const result = await artistService.listArtists();
    
    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockArtists);
  });

  it('should transform Supabase errors to AppErrors', async () => {
    mockSupabaseClient.from().then.mockResolvedValueOnce({
      data: null,
      error: { message: 'Database error', code: 'DB_ERROR' },
    });

    const result = await artistService.listArtists();
    
    expect(result.success).toBe(false);
    expect(result.error.type).toBe('server');
  });
});
```

### 2. Hooks Testing (85% Coverage Target)

**Focus Areas:**
- State management logic
- Service integration
- Error handling
- Real-time validation
- Cache management

**Test Patterns:**
```typescript
// Hook test example
describe('useEvents', () => {
  it('should manage loading states correctly', async () => {
    const { result } = renderHook(() => useEvents());

    expect(result.current.loading.isLoading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.loading.isLoading).toBe(false);
    });
  });

  it('should handle optimistic updates', async () => {
    const { result } = renderHook(() => useEvents());
    
    const newEvent = { title: 'New Event', ... };
    await result.current.createEvent(newEvent);
    
    expect(result.current.events).toContain(
      expect.objectContaining({ title: 'New Event' })
    );
  });
});
```

### 3. Component Testing (80% Coverage Target)

**Focus Areas:**
- User interactions
- Props handling
- Conditional rendering
- Accessibility
- Error boundaries

**Test Patterns:**
```typescript
// Component test example
describe('EventFormModal', () => {
  it('should validate form fields in real-time', async () => {
    const user = userEvent.setup();
    render(<EventFormModal isOpen={true} />);

    const titleInput = screen.getByLabelText(/event title/i);
    await user.type(titleInput, '');
    await user.tab();

    expect(screen.getByText(/title is required/i)).toBeInTheDocument();
  });

  it('should submit form with valid data', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    
    render(<EventFormModal isOpen={true} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/title/i), 'Test Event');
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Test Event' })
    );
  });
});
```

### 4. Integration Testing

**Focus Areas:**
- Page-level functionality
- Feature workflows
- Cross-component communication
- Route handling

## Mock Data & Fixtures

### Global Test Utilities
```typescript
// Available in globalThis.testUtils
const mockEvent = globalThis.testUtils.mockEvent({
  title: 'Custom Event',
  date: '2024-12-31T20:00:00Z'
});

const mockArtist = globalThis.testUtils.mockArtist({
  name: 'Test Artist',
  genre: 'Rock'
});
```

### MSW API Mocking
```typescript
// Handlers for realistic API responses
const handlers = [
  rest.get('/api/events', (req, res, ctx) => {
    return res(ctx.json({
      data: [mockEvent()],
      meta: { total: 1, page: 1 }
    }));
  }),
];
```

## Error Testing Strategy

### Error Types Coverage
1. **Validation Errors** - Field-level and form-level validation
2. **Authentication Errors** - Session expiration, invalid tokens
3. **Authorization Errors** - Permission denied, role restrictions
4. **Network Errors** - Connection failures, timeouts
5. **Server Errors** - Database failures, service unavailable
6. **Not Found Errors** - Missing resources

### Error Boundary Testing
```typescript
describe('ErrorBoundary', () => {
  it('should handle validation errors with field feedback', () => {
    const validationError = new Error('Validation failed');
    validationError.appError = {
      type: 'validation',
      message: 'Email is required',
      field: 'email'
    };

    render(
      <ErrorBoundary>
        <ThrowError error={validationError} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Validation Error')).toBeInTheDocument();
  });
});
```

## Performance Testing

### Metrics Tracked
- Component render times
- Hook execution performance
- Service response times
- Bundle size impact

### Testing Approach
```typescript
describe('Performance', () => {
  it('should render large event lists efficiently', () => {
    const largeEventList = Array.from({ length: 1000 }, () => mockEvent());
    
    const startTime = performance.now();
    render(<EventList events={largeEventList} />);
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(100); // 100ms threshold
  });
});
```

## Accessibility Testing

### Focus Areas
- ARIA attributes
- Keyboard navigation
- Screen reader compatibility
- Color contrast
- Focus management

### Testing Patterns
```typescript
describe('Accessibility', () => {
  it('should have proper ARIA labels', () => {
    render(<EventFormModal />);
    
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby');
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-describedby');
  });

  it('should manage focus correctly', async () => {
    const user = userEvent.setup();
    render(<EventFormModal />);
    
    await user.tab();
    expect(screen.getByLabelText(/title/i)).toHaveFocus();
  });
});
```

## Test Configuration

### Vitest Configuration
```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        'src/lib/api/services/**/*': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
      },
    },
  },
});
```

### Test Scripts
```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Testing Best Practices

### 1. Test Organization
- Group related tests in describe blocks
- Use descriptive test names that explain behavior
- Follow AAA pattern (Arrange, Act, Assert)

### 2. Mock Strategy
- Mock external dependencies, not internal logic
- Use MSW for API mocking
- Reset mocks between tests

### 3. Async Testing
- Use waitFor for async state updates
- Prefer user events over fireEvent
- Test loading and error states

### 4. Accessibility
- Test with screen readers in mind
- Verify keyboard navigation
- Check ARIA attributes

### 5. Performance
- Test with realistic data sizes
- Monitor render performance
- Validate bundle size impact

## Coverage Requirements

### Minimum Coverage Targets
- **Service Layer**: 90%
- **Hooks**: 85%
- **Components**: 80%
- **Overall Project**: 80%

### Critical Path Coverage
- Authentication flows: 95%
- Payment processing: 95%
- Event management: 90%
- Error handling: 90%

## Continuous Integration

### GitHub Actions Pipeline
```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
```

### Quality Gates
- All tests must pass
- Coverage thresholds must be met
- No accessibility violations
- Performance benchmarks maintained

## Debugging Tests

### Common Issues
1. **Async timing issues** - Use waitFor, avoid setTimeout
2. **Mock persistence** - Reset mocks in beforeEach
3. **DOM cleanup** - Use cleanup from testing-library
4. **Environment variables** - Mock in test setup

### Debug Tools
- `screen.debug()` - Print current DOM
- `logRoles()` - Show available ARIA roles
- Vitest UI - Visual test runner
- Browser DevTools - For component debugging

## Test Data Management

### Fixture Patterns
```typescript
// fixtures/events.ts
export const createEvent = (overrides = {}) => ({
  id: 'event-1',
  title: 'Default Event',
  date: new Date().toISOString(),
  ...overrides,
});
```

### Database Seeding
```typescript
// For integration tests
beforeEach(async () => {
  await seedDatabase([
    createEvent({ title: 'Seeded Event 1' }),
    createEvent({ title: 'Seeded Event 2' }),
  ]);
});
```

## Reporting & Monitoring

### Coverage Reports
- HTML reports in `./coverage/index.html`
- Console output for CI/CD
- Codecov integration for PR reviews

### Test Results
- JUnit XML for CI integration
- HTML reports with detailed results
- Performance metrics tracking

## Migration & Maintenance

### Version Updates
- Keep testing dependencies current
- Monitor for breaking changes
- Update snapshots as needed

### Test Refactoring
- Remove duplicate test logic
- Abstract common patterns
- Update as API changes

This testing suite provides comprehensive coverage while maintaining developer productivity and code quality. The focus on real-world scenarios and user-centric testing ensures that our application works correctly for end users. 