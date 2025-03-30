import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { saveAuth, loadAuth, clearAuth, isAuthenticated } from '../utils/auth';

// Aggiungi queste configurazioni dopo gli imports
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Inizializzazione - controlla localStorage al caricamento
  useEffect(() => {
    console.log('AuthContext inizializzato');
    
    const authData = loadAuth();
    if (authData) {
      console.log('Utente trovato in localStorage:', authData.user.name);
      setUser(authData.user);
      setToken(authData.token);
      
      // Imposta l'header di autorizzazione
      axios.defaults.headers.common['Authorization'] = `Bearer ${authData.token}`;
    }
    
    setLoading(false);
  }, []);

  // Login
  const login = (userData, authToken) => {
    console.log('Login chiamato in AuthContext');
    
    try {
      // Salva i dati
      saveAuth(authToken, userData);
      
      // Aggiorna lo stato
      setUser(userData);
      setToken(authToken);
      
      // Imposta l'header di autorizzazione
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      
      console.log('Login completato con successo');
      return true;
    } catch (error) {
      console.error('Errore durante il login:', error);
      return false;
    }
  };

  // Logout
  const logout = () => {
    console.log('Logout chiamato');
    
    // Rimuovi i dati
    clearAuth();
    
    // Resetta lo stato
    setUser(null);
    setToken(null);
    
    // Rimuovi l'header di autorizzazione
    delete axios.defaults.headers.common['Authorization'];
    
    console.log('Logout completato');
  };

  // Verifica dell'autenticazione
  const checkAuth = () => {
    return isAuthenticated();
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    login,
    logout,
    checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;