import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Login = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const userDataStr = params.get('user');

        if (userDataStr) {
            console.log("Ricevuti dati utente nell'URL:", userDataStr.substring(0, 50) + "...");
            try {
                const userData = JSON.parse(decodeURIComponent(userDataStr));
                console.log('Dati utente decodificati:', userData);
                
                // Prepara i dati utente
                const user = {
                    ...userData,
                    name: `${userData.firstName} ${userData.lastName}`
                };
                
                // Effettua il login
                login(user);
                
                // Reindirizza alla home
                navigate('/', { replace: true });
            } catch (error) {
                console.error('Errore nel parsing dei dati utente:', error);
                setError('Errore durante il login con Google');
            }
        }
    }, [location, login, navigate]);

    return (
        <div>
            {/* Renderizza il componente di login */}
        </div>
    );
};

export default Login; 