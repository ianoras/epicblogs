import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Context per l'autenticazione
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
        
        // Imposta il token nelle richieste axios
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error('Errore nel parsing dei dati utente salvati:', error);
        // Se c'è un errore, pulisci il localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    
    setLoading(false);
  }, []);

  const login = (userData) => {
    console.log('Login con dati:', userData);
    setUser(userData);
    
    // Imposta il token nelle richieste axios se presente
    if (userData.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Rimuovi il token dalle richieste axios
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('user', JSON.stringify(updatedUserData));
    // Aggiorna il timestamp quando l'utente viene aggiornato
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