import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Aggiungi queste configurazioni dopo gli imports
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timestamp, setTimestamp] = useState(new Date().getTime());

  useEffect(() => {
    // Controlla se c'è un utente salvato nel localStorage
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        // Imposta il token nell'header di default per axios
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error('Errore nel parsing dei dati utente salvati:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (userData, token) => {
    console.log('Login con dati:', userData);
    setUser(userData);
    if (token) {
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('user', JSON.stringify(updatedUserData));
    setTimestamp(new Date().getTime());
  };

  const value = {
    user,
    login,
    logout,
    updateUser,
    loading,
    timestamp
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;