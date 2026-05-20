import { createContext, useState, useEffect, useContext } from 'react';
import { API_BASE_URL } from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (data.otpRequired) {
          return { success: true, otpRequired: true, email: data.email };
        }
        localStorage.setItem('userInfo', JSON.stringify(data));
        setUser(data);
        return { success: true, user: data };
      } else {
        return { success: false, error: data.message };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const signup = async (firstName, lastName, email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (data.otpRequired) {
          return { success: true, otpRequired: true, email: data.email };
        }
        localStorage.setItem('userInfo', JSON.stringify(data));
        setUser(data);
        return { success: true, user: data };
      } else {
        return { success: false, error: data.message };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const verifyOtp = async (email, otpCode) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otpCode }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('userInfo', JSON.stringify(data));
        setUser(data);
        return { success: true, user: data };
      } else {
        return { success: false, error: data.message };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const resendOtp = async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.message };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  const updateIgConnection = (status) => {
    if (user) {
      const updatedUser = { ...user, instagramConnected: status };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, verifyOtp, resendOtp, logout, updateIgConnection }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
