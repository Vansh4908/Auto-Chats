import { createContext, useState, useEffect, useContext } from 'react';

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
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
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

  const signup = async (firstName, lastName, email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password }),
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
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateIgConnection }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
