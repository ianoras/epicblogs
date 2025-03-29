import { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert, Card, Spinner } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    // Gestisce il login con Google quando l'utente ritorna
    useEffect(() => {
        console.log("Login useEffect - search params:", location.search);
        const params = new URLSearchParams(location.search);
        const userDataStr = params.get('user');
        const token = params.get('token');

        console.log("User data string:", userDataStr ? userDataStr.substring(0, 50) + "..." : "null");
        console.log("Token:", token ? token.substring(0, 20) + "..." : "null");

        if (userDataStr && token) {
            try {
                const userData = JSON.parse(decodeURIComponent(userDataStr));
                console.log('Dati utente decodificati:', userData);
                
                // Salva il token nel localStorage
                localStorage.setItem('token', token);
                
                // Prepara i dati utente
                const user = {
                    ...userData,
                    name: `${userData.firstName} ${userData.lastName}`
                };
                
                // Salva l'utente nel localStorage
                localStorage.setItem('user', JSON.stringify(user));
                
                // Effettua il login
                login(user);
                
                // Reindirizza alla home
                console.log("Reindirizzamento alla home");
                setTimeout(() => {
                    navigate('/', { replace: true });
                }, 100);
            } catch (error) {
                console.error('Errore nel parsing dei dati utente:', error);
                setError('Errore durante il login con Google: ' + error.message);
            }
        }
    }, [location, login, navigate]);

    // Aggiungi nell'useEffect:
    useEffect(() => {
        console.log('Login component mounted - checking URL for params');
        const searchParams = new URLSearchParams(window.location.search);
        
        const userParam = searchParams.get('user');
        const tokenParam = searchParams.get('token');
        
        console.log('URL params:', { userParam: !!userParam, tokenParam: !!tokenParam });
        
        if (userParam && tokenParam) {
            try {
                const userData = JSON.parse(decodeURIComponent(userParam));
                const token = decodeURIComponent(tokenParam);
                
                console.log('Parsed user data:', userData);
                console.log('Token from URL:', token.substring(0, 10) + '...');
                
                // Chiamata al login con un piccolo ritardo per garantire che lo stato sia aggiornato
                setTimeout(() => {
                    const success = login(userData, token);
                    if (success) {
                        console.log('Autenticazione via URL params completata');
                        navigate('/');
                    } else {
                        console.error('Errore durante l\'autenticazione con i parametri URL');
                    }
                }, 300);
            } catch (error) {
                console.error('Errore nel parsing dei parametri URL:', error);
            }
        }
    }, [login, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.data) {
                const { token, user } = response.data;
                
                // Salva il token nel localStorage
                localStorage.setItem('token', token);
                
                // Prepara i dati utente
                const userData = {
                    ...user,
                    name: `${user.firstName} ${user.lastName}`
                };
                
                // Salva l'utente nel localStorage
                localStorage.setItem('user', JSON.stringify(userData));
                
                // Effettua il login
                login(userData);
                
                // Reindirizza alla home
                navigate('/', { replace: true });
            }
        } catch (err) {
            console.error('Errore login:', err);
            setError(err.response?.data?.message || 'Errore durante il login');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        // URL hardcoded per evitare problemi
        window.location.href = 'https://epicblogs.onrender.com/auth/google';
    };

    return (
        <Container className="py-5">
            {/* Debug info - Solo per test */}
            <div className="mb-4 p-3 border rounded bg-light">
                <h5>Debug Info (rimuovere in produzione)</h5>
                <p>URL search: {location.search}</p>
                <p>Has user param: {new URLSearchParams(location.search).has('user').toString()}</p>
                <p>Has token param: {new URLSearchParams(location.search).has('token').toString()}</p>
            </div>
            
            <Row className="justify-content-center">
                <Col md={6}>
                    <Card className="shadow border-0">
                        <Card.Body className="p-5">
                            <h2 className="text-center mb-4">Accedi</h2>
                            {error && <Alert variant="danger">{error}</Alert>}
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                </Form.Group>

                                <div className="d-grid gap-2">
                                    <Button variant="primary" type="submit" disabled={loading}>
                                        {loading ? (
                                            <Spinner animation="border" size="sm" className="me-2" />
                                        ) : null}
                                        Accedi
                                    </Button>

                                    <div className="d-flex justify-content-center my-3">
                                        <GoogleLogin
                                            onSuccess={handleGoogleLogin}
                                            onError={() => setError('Login con Google fallito')}
                                            useOneTap
                                            text="continue_with"
                                            shape="pill"
                                            locale="it"
                                        />
                                    </div>
                                </div>

                                <div className="text-center mt-4">
                                    <p>Non hai un account? <Link to="/register">Registrati ora</Link></p>
                                </div>
                                
                                <div className="text-center mt-4">
                                    <Link to="/" className="btn btn-outline-secondary">
                                        <i className="bi bi-arrow-left me-2"></i>Torna alla Home
                                    </Link>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Login;