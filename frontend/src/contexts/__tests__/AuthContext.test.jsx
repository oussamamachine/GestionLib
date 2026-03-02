import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import api from '../../services/api';

// Mock the api service
jest.mock('../../services/api');

// Test component that uses the auth context
const TestComponent = () => {
  const { user, login, logout, loading } = useAuth();
  
  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : user ? (
        <div>
          <div>User: {user.username}</div>
          <div>Role: {user.role}</div>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div>
          <div>Not logged in</div>
          <button onClick={() => login('admin', 'password')}>Login</button>
        </div>
      )}
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('initializes with no user', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByText(/not logged in/i)).toBeInTheDocument();
  });

  it('logs in user successfully', async () => {
    const mockResponse = {
      data: {
        token: 'fake-token',
        username: 'admin',
        email: 'admin@example.com',
        role: 'Admin'
      }
    };
    
    api.post.mockResolvedValueOnce(mockResponse);
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    await act(async () => {
      loginButton.click();
    });
    
    await waitFor(() => {
      expect(screen.getByText(/user: admin/i)).toBeInTheDocument();
      expect(screen.getByText(/role: admin/i)).toBeInTheDocument();
    });
    
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'fake-token');
  });

  it('logs out user', async () => {
    // Set up initial logged-in state
    localStorage.setItem('token', 'fake-token');
    api.get.mockResolvedValueOnce({
      data: {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        role: 'Admin'
      }
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/user: admin/i)).toBeInTheDocument();
    });
    
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    
    act(() => {
      logoutButton.click();
    });
    
    await waitFor(() => {
      expect(screen.getByText(/not logged in/i)).toBeInTheDocument();
    });
    
    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
  });

  it('loads user from token on mount', async () => {
    localStorage.setItem('token', 'existing-token');
    api.get.mockResolvedValueOnce({
      data: {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'Member'
      }
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText(/user: testuser/i)).toBeInTheDocument();
      expect(screen.getByText(/role: member/i)).toBeInTheDocument();
    });
  });

  it('handles login error', async () => {
    api.post.mockRejectedValueOnce(new Error('Invalid credentials'));
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    await act(async () => {
      loginButton.click();
    });
    
    await waitFor(() => {
      expect(screen.getByText(/not logged in/i)).toBeInTheDocument();
    });
  });

  it('sets authorization header after login', async () => {
    const mockResponse = {
      data: {
        token: 'new-token',
        username: 'user',
        email: 'user@example.com',
        role: 'Librarian'
      }
    };
    
    api.post.mockResolvedValueOnce(mockResponse);
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    await act(async () => {
      loginButton.click();
    });
    
    await waitFor(() => {
      expect(api.defaults.headers.common['Authorization']).toBe('Bearer new-token');
    });
  });
});
