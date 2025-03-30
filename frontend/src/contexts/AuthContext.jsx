import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Context per l'autenticazione
const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Inizializzazione
  useEffect(() => {
    console.log('AuthContext: inizializzazione');
    
    try {
      const savedToken = localStorage.getItem('token');
      const savedUserStr = localStorage.getItem('user');
      
      if (savedToken && savedUserStr) {
        const savedUser = JSON.parse(savedUserStr);
        console.log('AuthContext: dati trovati in localStorage');
        
        setUser(savedUser);
        setToken(savedToken);
        
        // Configura axios
        axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      }
    } catch (error) {
      console.error('AuthContext: errore durante l\'inizializzazione', error);
    }
  }, []);

  // Login
  const login = (userData, authToken) => {
    console.log('AuthContext: login chiamato');
    
    try {
      // Salva i dati
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Aggiorna lo stato
      setUser(userData);
      setToken(authToken);
      
      // Configura axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      
      return true;
    } catch (error) {
      console.error('AuthContext: errore durante il login', error);
      return false;
    }
  };

  // Logout
  const logout = () => {
    console.log('AuthContext: logout chiamato');
    
    // Rimuovi i dati
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Aggiorna lo stato
    setUser(null);
    setToken(null);
    
    // Rimuovi la configurazione di axios
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;