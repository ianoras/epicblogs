import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthDebug = () => {
  const { user } = useAuth();
  
  return (
    <div style={{ position: 'fixed', bottom: 10, right: 10, background: '#f8f9fa', padding: 10, border: '1px solid #ddd', borderRadius: 5, zIndex: 9999 }}>
      <h6>Auth Debug</h6>
      <p>User: {user ? `${user.firstName} ${user.lastName}` : 'Non autenticato'}</p>
      <p>Token: {localStorage.getItem('token') ? 'Presente' : 'Assente'}</p>
    </div>
  );
};

export default AuthDebug; 