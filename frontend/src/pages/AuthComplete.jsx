import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthComplete = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    try {
      // Recupera i dati dal localStorage
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (!token || !userStr) {
        throw new Error('Dati di autenticazione mancanti');
      }

      const userData = JSON.parse(userStr);
      
      // Effettua il login
      const success = login(userData, token);
      
      if (success) {
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
      </div>
    </div>
  );
};

export default AuthComplete; 