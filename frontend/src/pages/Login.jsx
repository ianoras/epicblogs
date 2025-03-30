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

    useEffect(() => {
        const handleAuthParams = async () => {
            console.log('=== CONTROLLO PARAMETRI URL ===');
            const params = new URLSearchParams(window.location.search);
            const userParam = params.get('user');
            const tokenParam = params.get('token');

            console.log('Parametri trovati:', {
                userParam: userParam ? 'presente' : 'assente',
                tokenParam: tokenParam ? 'presente' : 'assente'
            });

            if (userParam && tokenParam) {
                try {
                    console.log('Decodifico i parametri...');
                    const userData = JSON.parse(decodeURIComponent(userParam));
                    const token = decodeURIComponent(tokenParam);

                    console.log('Dati utente decodificati:', {
                        id: userData._id,
                        name: userData.name,
                        email: userData.email
                    });
                    console.log('Token decodificato (primi 20 caratteri):', token.substring(0, 20));

                    // Prima salva in localStorage
                    console.log('Salvataggio in localStorage...');
                    localStorage.setItem('user', JSON.stringify(userData));
                    localStorage.setItem('token', token);

                    // Poi effettua il login
                    console.log('Tentativo di login...');
                    const success = login(userData, token);

                    if (success) {
                        console.log('Login riuscito, reindirizzamento alla home...');
                        // Aggiungi un piccolo ritardo per assicurarti che lo stato sia aggiornato
                        setTimeout(() => {
                            navigate('/', { replace: true });
                        }, 500);
                    } else {
                        console.error('Login fallito dopo il successo del salvataggio');
                        setError('Errore durante il login');
                    }
                } catch (error) {
                    console.error('Errore durante il processo di login:', error);
                    setError('Errore durante il login: ' + error.message);
                }
            }
        };

        handleAuthParams();
    }, [location, login, navigate]);

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
        window.location.href = `${process.env.REACT_APP_API_URL}/auth/google`;
    };

    return (
        <Container className="py-5">
            {/* Aggiungi una sezione di debug */}
            <div className="mb-4 p-3 border rounded bg-light">
                <h5>Debug Info</h5>
                <p>URL: {window.location.href}</p>
                <p>Search Params: {window.location.search}</p>
                <p>LocalStorage Token: {localStorage.getItem('token') ? 'Presente' : 'Assente'}</p>
                <p>LocalStorage User: {localStorage.getItem('user') ? 'Presente' : 'Assente'}</p>
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