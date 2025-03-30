// Salva le informazioni di autenticazione
export const saveAuth = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  
  // Imposta gli header per axios
  const axios = require('axios');
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Carica le informazioni di autenticazione
export const loadAuth = () => {
  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      return null;
    }
    
    const user = JSON.parse(userStr);
    
    // Imposta gli header per axios
    const axios = require('axios');
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    return { user, token };
  } catch (error) {
    console.error('Errore nel caricamento dello stato di autenticazione:', error);
    return null;
  }
};

// Cancella le informazioni di autenticazione
export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Rimuovi gli header per axios
  const axios = require('axios');
  delete axios.defaults.headers.common['Authorization'];
};

// Verifica se l'utente è autenticato
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
}; 