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
    console.log("AuthContext: Inizializzazione, controllo localStorage");
    
    // Controlla se c'è un utente salvato nel localStorage
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    console.log("AuthContext: Token trovato?", !!token);
    console.log("AuthContext: User trovato?", !!savedUser);
    
    if (savedUser && token) {
      try {
        const userData = JSON.parse(savedUser);
        console.log("AuthContext: Dati utente caricati", userData.firstName, userData.lastName);
        
        setUser(userData);
        
        // Imposta il token nell'header di default per axios
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log("AuthContext: Header Authorization impostato");
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
    
    // Imposta il token se fornito
    if (token) {
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log("Token salvato e header impostato");
    } else {
      // Prova a recuperare il token dal localStorage
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        console.log("Header impostato con token esistente");
      }
    }
    
    localStorage.setItem('user', JSON.stringify(userData));
    console.log("Dati utente salvati in localStorage");
  };

  const logout = () => {
    console.log("Logout: Rimozione dati utente e token");
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateUser = (updatedUserData) => {
    console.log("Aggiornamento utente:", updatedUserData.firstName, updatedUserData.lastName);
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