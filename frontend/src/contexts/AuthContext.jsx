import React, { createContext, useContext, useState, useEffect } from 'react';
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
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Funzione per impostare i header di Axios
  const setAuthHeader = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Header di autorizzazione impostato:', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      console.log('Header di autorizzazione rimosso');
    }
  };

  // Inizializzazione - controlla localStorage al caricamento
  useEffect(() => {
    console.log('AuthContext inizializzato, verifico localStorage');
    
    try {
      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('token');
      
      console.log('Dati trovati in localStorage:', { savedUser: !!savedUser, savedToken: !!savedToken });
      
      if (savedToken && savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setToken(savedToken);
        setAuthHeader(savedToken);
        console.log('Utente caricato da localStorage:', parsedUser.name || parsedUser.username);
      }
    } catch (error) {
      console.error('Errore nel recupero dati da localStorage:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Login
  const login = (userData, authToken) => {
    console.log('Login chiamato con:', { userData, authToken });
    
    try {
      // Salva in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', authToken);
      
      // Aggiorna lo stato
      setUser(userData);
      setToken(authToken);
      
      // Imposta l'header di autorizzazione
      setAuthHeader(authToken);
      
      console.log('Login completato con successo per:', userData.name || userData.username);
      return true;
    } catch (error) {
      console.error('Errore durante il login:', error);
      return false;
    }
  };

  // Logout
  const logout = () => {
    console.log('Logout chiamato');
    
    // Rimuovi da localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Resetta lo stato
    setUser(null);
    setToken(null);
    
    // Rimuovi l'header di autorizzazione
    setAuthHeader(null);
    
    console.log('Logout completato');
  };

  // Aggiorna dati utente
  const updateUser = (userData) => {
    console.log('Aggiornamento dati utente:', userData);
    
    try {
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      console.log('Dati utente aggiornati con successo');
      return true;
    } catch (error) {
      console.error('Errore nell\'aggiornamento dei dati utente:', error);
      return false;
    }
  };

  // DEBUG: Verifica lo stato corrente
  useEffect(() => {
    console.log('Stato attuale AuthContext:', { 
      isAuthenticated: !!user, 
      hasToken: !!token,
      user: user ? (user.name || user.username) : 'nessuno'
    });
  }, [user, token]);

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;