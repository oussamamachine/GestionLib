import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import KeyboardShortcutsHelper from './components/KeyboardShortcutsHelper';
import './index.css';

// Protected route component that checks authentication and role
function Protected({ children, roles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/admin/*"
          element={
            <Protected roles={["Admin"]}>
              <Dashboard role="Admin" />
            </Protected>
          }
        />
        <Route
          path="/librarian/*"
          element={
            <Protected roles={["Librarian"]}>
              <Dashboard role="Librarian" />
            </Protected>
          }
        />
        <Route
          path="/member/*"
          element={
            <Protected roles={["Member"]}>
              <Dashboard role="Member" />
            </Protected>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
      <KeyboardShortcutsHelper />
    </AuthProvider>
  );
}
