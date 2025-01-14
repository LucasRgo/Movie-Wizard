import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const AuthContext = React.createContext();
const csrfToken = Cookies.get('csrftoken');

const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastAction, setLastAction] = useState(null); // New state variable to track last action

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/user/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      setIsLoggedIn(false);
    } finally {
      setIsInitialized(true);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await fetch('api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        setLastAction('login');
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const logout = async () => {
    try {
      await fetch('api/logout/', {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
      });
      setUser(null); // Clear user data on logout
      setIsLoggedIn(false);
      setLastAction('logout'); // Update last action on logout
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch('api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        setLastAction('register'); // Update last action on successful registration
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  useEffect(() => {
    if (lastAction === 'login' || lastAction === 'register') {
      fetchCurrentUser();
    }
  }, [lastAction]);

  useEffect(() => {
    if (!isInitialized) {
      fetchCurrentUser();
    }
  }, [isInitialized]);

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };
