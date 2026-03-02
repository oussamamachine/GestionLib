# Frontend Testing Guide

## Overview
This project uses **Jest** and **React Testing Library** for comprehensive frontend testing. Tests cover components, pages, contexts, and utility functions.

## Test Structure

```
src/
├── components/
│   └── __tests__/
│       ├── Button.test.jsx
│       ├── Input.test.jsx
│       ├── Card.test.jsx
│       └── Modal.test.jsx
├── contexts/
│   └── __tests__/
│       └── AuthContext.test.jsx
├── pages/
│   └── __tests__/
│       └── Login.test.jsx
├── utils/
│   └── __tests__/
│       ├── validation.test.js
│       └── dateUtils.test.js
└── tests/
    ├── setup.js
    └── README.md (this file)
```

## Test Coverage

### Component Tests (46 tests)
- **Button.test.jsx** (11 tests): Variants, sizes, click handlers, disabled state
- **Input.test.jsx** (10 tests): Input types, validation, error states, onChange
- **Card.test.jsx** (6 tests): Title, children, styling
- **Modal.test.jsx** (7 tests): Open/close, backdrop clicks, title
- **AuthContext.test.jsx** (7 tests): Login, logout, token persistence, error handling
- **Login.test.jsx** (8 tests): Form validation, submission, error display, navigation

### Utility Tests (22 tests)
- **validation.test.js** (18 tests): Email, password, ISBN, required field validation
- **dateUtils.test.js** (14 tests): Date formatting, overdue calculation, date arithmetic

**Total: 68+ frontend tests**

## Running Tests

### Run all tests
```bash
cd frontend
npm test
```

### Run tests in watch mode (for development)
```bash
npm run test:watch
```

### Generate coverage report
```bash
npm run test:coverage
```

### Run specific test file
```bash
npm test Button.test.jsx
```

### Run tests matching pattern
```bash
npm test -- --testNamePattern="validation"
```

## Test Patterns

### Component Testing Pattern
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText(/expected text/i)).toBeInTheDocument();
  });

  it('handles user interaction', () => {
    const handleClick = jest.fn();
    render(<MyComponent onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Context Testing Pattern
```javascript
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';

const TestComponent = () => {
  const { user, login } = useAuth();
  return <div>{user ? user.username : 'Not logged in'}</div>;
};

describe('AuthContext', () => {
  it('provides authentication state', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/not logged in/i)).toBeInTheDocument();
    });
  });
});
```

### API Mocking Pattern
```javascript
import api from '../../services/api';

jest.mock('../../services/api');

it('fetches data successfully', async () => {
  api.get.mockResolvedValueOnce({ data: { id: 1, name: 'Test' } });
  
  // Test component that uses api
  // Assertions...
});
```

## Coverage Thresholds

Configured in `jest.config.cjs`:
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## Mocked Dependencies

### Global Mocks (setup.js)
- `window.matchMedia`
- `localStorage`
- `sessionStorage`

### Module Mocks
- `../../services/api` (axios instance)
- `react-router-dom` (useNavigate, useLocation)

## Best Practices

### 1. Test User Behavior, Not Implementation
```javascript
// ✅ Good - tests user interaction
fireEvent.click(screen.getByRole('button', { name: /submit/i }));

// ❌ Bad - tests implementation details
wrapper.find('.submit-button').simulate('click');
```

### 2. Use Accessible Queries
Priority order:
1. `getByRole`
2. `getByLabelText`
3. `getByPlaceholderText`
4. `getByText`
5. `getByTestId` (last resort)

### 3. Handle Async Operations
```javascript
// Use waitFor for async state changes
await waitFor(() => {
  expect(screen.getByText(/success/i)).toBeInTheDocument();
});

// Use userEvent for realistic interactions
import userEvent from '@testing-library/user-event';
await userEvent.type(input, 'test@example.com');
```

### 4. Clean Up After Tests
```javascript
beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});
```

### 5. Test Edge Cases
- Empty states
- Error states
- Loading states
- Disabled states
- Permission/role-based rendering

## Common Testing Utilities

### @testing-library/react
- `render()` - Render components
- `screen` - Query rendered output
- `fireEvent` - Trigger DOM events
- `waitFor()` - Wait for async updates
- `act()` - Wrap state updates

### @testing-library/jest-dom
Custom matchers:
- `toBeInTheDocument()`
- `toHaveClass()`
- `toBeDisabled()`
- `toHaveValue()`
- `toHaveAttribute()`

### Jest
- `describe()` - Group tests
- `it()` / `test()` - Individual test
- `expect()` - Assertions
- `jest.fn()` - Mock functions
- `jest.mock()` - Mock modules
- `beforeEach()` / `afterEach()` - Setup/teardown

## Continuous Integration

Tests run automatically in CI/CD pipeline:
```yaml
- name: Run Frontend Tests
  run: |
    cd frontend
    npm ci
    npm test -- --coverage --watchAll=false
```

## Debugging Tests

### Run single test in debug mode
```bash
node --inspect-brk node_modules/.bin/jest --runInBand Button.test.jsx
```

### View detailed output
```bash
npm test -- --verbose
```

### Check what's rendered
```javascript
import { screen, debug } from '@testing-library/react';
debug(); // Prints entire DOM
debug(screen.getByRole('button')); // Prints specific element
```

## Resources

- [React Testing Library Docs](https://testing-library.com/react)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library Cheatsheet](https://testing-library.com/docs/react-testing-library/cheatsheet)
- [Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
