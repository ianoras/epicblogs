import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthComplete = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    console.log('=== AUTH COMPLETE INIZIATO ===');
    try {
      // Recupera i dati dal localStorage
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      console.log('Dati trovati in localStorage:');
      console.log('Token:', token ? token.substring(0, 20) + '...' : 'null');
      console.log('User string:', userStr ? userStr.substring(0, 50) + '...' : 'null');
      
      if (!token || !userStr) {
        throw new Error('Dati di autenticazione mancanti');
      }

      const userData = JSON.parse(userStr);
      console.log('User data parsed:', userData);
      
      // Effettua il login
      console.log('Chiamata alla funzione login...');
      const success = login(userData, token);
      
      console.log('Risultato login:', success);
      
      if (success) {
        console.log('Login riuscito, reindirizzamento alla home');
        navigate('/', { replace: true });
      } else {
        throw new Error('Login fallito');
      }
    } catch (error) {
      console.error('Errore durante l\'autenticazione:', error);
      navigate('/login', { replace: true });
    }
  }, [login, navigate]);

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Caricamento...</span>
        </div>
        <p className="mt-3">Completamento autenticazione...</p>
        <small className="text-muted">Controlla la console per i dettagli</small>
      </div>
    </div>
  );
};

export default AuthComplete; 