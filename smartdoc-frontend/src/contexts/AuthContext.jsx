import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

// API base URL - change this if your backend runs on a different port
const API_BASE_URL = 'http://localhost:5000/api';

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 🔹 Logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  // 🔹 Refresh token
  const refreshAuthToken = async (refreshToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem('token', result.access_token);
        if (result.refresh_token) {
          localStorage.setItem('refreshToken', result.refresh_token);
        }
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        }
        return true;
      }
      logout();
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
      return false;
    }
  };

  // 🔹 Check authentication on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          const response = await fetch(`${API_BASE_URL}/verify-token`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
          });

          const data = await response.json();

          if (response.ok && data.valid) {
            setCurrentUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
          } else if (data.expired) {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              await refreshAuthToken(refreshToken);
            } else {
              logout();
            }
          } else {
            logout();
          }
        } catch (error) {
          console.error('Auth verification error:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  // 🔹 Login
  const login = async (username, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem('token', result.access_token);
        if (result.refresh_token) {
          localStorage.setItem('refreshToken', result.refresh_token);
        }
        localStorage.setItem('user', JSON.stringify(result.user));

        setCurrentUser(result.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // 🔹 Signup
  const signup = async (username, email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem('token', result.access_token);
        if (result.refresh_token) {
          localStorage.setItem('refreshToken', result.refresh_token);
        }
        localStorage.setItem('user', JSON.stringify(result.user));

        setCurrentUser(result.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Signup failed' };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    signup,
    logout,
    refreshAuthToken,
    API_BASE_URL, // Export this for use in other components
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
};
