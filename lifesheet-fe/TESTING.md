# Testing Guide

This project uses **Vitest** and **React Testing Library** for unit testing.

## Setup

The testing setup includes:

- **Vitest**: Fast unit test framework that works seamlessly with Vite
- **React Testing Library**: Simple and complete testing utilities for React components
- **jsdom**: DOM implementation for Node.js (for browser environment simulation)
- **@testing-library/jest-dom**: Custom Jest matchers for DOM elements

### Configuration Files

- **`vitest.config.ts`**: Dedicated Vitest configuration with test-specific settings
- **`tsconfig.test.json`**: TypeScript configuration for test files (extends `tsconfig.app.json`)
- **`tsconfig.app.json`**: Excludes test files from production builds
- **`src/test/setup.ts`**: Global test setup and mocks
- **`src/test/test-utils.tsx`**: Custom testing utilities

## Running Tests

```bash
# Run tests in watch mode (recommended for development)
yarn test

# Run tests once
yarn test:run

# Run tests with UI
yarn test:ui

# Run tests with coverage report
yarn test:coverage

# Run tests in watch mode
yarn test:watch
```

## Test Structure

### File Naming Convention
- Test files should be named `*.test.ts` or `*.test.tsx`
- Spec files should be named `*.spec.ts` or `*.spec.tsx`
- Place test files next to the components they test or in a `__tests__` directory

### Example Test Structure
```
src/
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   └── button.test.tsx
│   └── welcome.tsx
│   └── welcome.test.tsx
├── lib/
│   ├── utils.ts
│   └── utils.test.ts
└── test/
    ├── setup.ts
    └── test-utils.tsx
```

## Writing Tests

### Basic Component Test
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { Button } from './button';

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });
});
```

### Testing User Interactions
```tsx
import { fireEvent } from '@testing-library/react';

it('handles click events', () => {
  const handleClick = vi.fn();
  render(<Button onClick={handleClick}>Click me</Button>);
  
  fireEvent.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### Testing with Mocking
```tsx
import { vi } from 'vitest';

// Mock a hook
const mockLoginWithRedirect = vi.fn();
vi.mock('@/hooks/auth-hook', () => ({
  useAuth: () => ({
    loginWithRedirect: mockLoginWithRedirect,
  }),
}));
```

## Test Utilities

The project includes custom test utilities in `src/test/test-utils.tsx`:

- **Custom render function**: Wraps components with necessary providers (Router, Intl, etc.)
- **Mock data helpers**: Functions to create mock user data, CV data, etc.
- **API mocking helpers**: Functions to mock API responses and errors

### Using Custom Render
```tsx
import { render } from '@/test/test-utils';

// Automatically wraps with Router, Intl, and other providers
render(<MyComponent />);

// With custom locale
render(<MyComponent />, { locale: 'de' });
```

## Testing Best Practices

### 1. Test Behavior, Not Implementation
```tsx
// ❌ Testing implementation details
expect(component.state.isLoading).toBe(true);

// ✅ Testing user-visible behavior
expect(screen.getByText('Loading...')).toBeInTheDocument();
```

### 2. Use Semantic Queries
```tsx
// ❌ Fragile selectors
screen.getByClassName('btn-primary');

// ✅ Semantic queries
screen.getByRole('button', { name: /submit/i });
```

### 3. Test User Interactions
```tsx
// Test what users can see and do
const user = userEvent.setup();
await user.click(screen.getByRole('button'));
await user.type(screen.getByLabelText(/email/i), 'test@example.com');
```

### 4. Mock External Dependencies
```tsx
// Mock API calls
vi.mock('@/services/api', () => ({
  fetchUser: vi.fn().mockResolvedValue({ id: 1, name: 'Test User' }),
}));

// Mock hooks
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: mockUser, login: vi.fn() }),
}));
```

## Coverage

The project is configured to generate coverage reports. Aim for:
- **Statements**: > 80%
- **Branches**: > 70%
- **Functions**: > 80%
- **Lines**: > 80%

Coverage reports are generated in the `coverage/` directory when running `yarn test:coverage`.

## Common Testing Patterns

### Testing Forms
```tsx
it('submits form with valid data', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  
  render(<ContactForm onSubmit={onSubmit} />);
  
  await user.type(screen.getByLabelText(/name/i), 'John Doe');
  await user.type(screen.getByLabelText(/email/i), 'john@example.com');
  await user.click(screen.getByRole('button', { name: /submit/i }));
  
  expect(onSubmit).toHaveBeenCalledWith({
    name: 'John Doe',
    email: 'john@example.com',
  });
});
```

### Testing Async Operations
```tsx
it('displays loading state', async () => {
  render(<DataComponent />);
  
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});
```

### Testing Error States
```tsx
it('displays error message on failure', async () => {
  vi.mocked(api.fetchData).mockRejectedValue(new Error('API Error'));
  
  render(<DataComponent />);
  
  await waitFor(() => {
    expect(screen.getByText('Error loading data')).toBeInTheDocument();
  });
});
```

## Debugging Tests

### Using screen.debug()
```tsx
it('debugs component output', () => {
  render(<MyComponent />);
  screen.debug(); // Prints the entire DOM
});
```

### Using Testing Library Queries
```tsx
// Find all buttons
screen.getAllByRole('button');

// Find by text content
screen.getByText('Submit');

// Find by test id
screen.getByTestId('submit-button');
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Queries](https://testing-library.com/docs/queries/about/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)
