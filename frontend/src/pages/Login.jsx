import { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert, Card, Spinner } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    // Gestisce il completamento del login con Google
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tempToken = params.get('tempToken');
        
        if (tempToken) {
            setMessage('Completamento autenticazione...');
            setLoading(true);
            
            console.log('Token temporaneo trovato:', tempToken);
            
            // Recupera i dati di autenticazione temporanei
            axios.get(`${process.env.REACT_APP_API_URL}/auth/temp-auth/${tempToken}`)
                .then(response => {
                    console.log('Dati autenticazione ricevuti');
                    const { user, token } = response.data;
                    
                    // Salva i dati in localStorage
                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify(user));
                    
                    // Aggiorna lo stato di autenticazione
                    const success = login(user, token);
                    
                    if (success) {
                        console.log('Login completato con successo');
                        navigate('/', { replace: true });
                    } else {
                        setError('Errore nell\'aggiornamento dello stato di autenticazione');
                    }
                })
                .catch(err => {
                    console.error('Errore nel recupero dei dati di autenticazione:', err);
                    setError('Errore nel completamento dell\'autenticazione');
                })
                .finally(() => {
                    setLoading(false);
                });
        }
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
            {message && <Alert variant="info">{message}</Alert>}
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
                                        <Button variant="outline-secondary" onClick={handleGoogleLogin}>
                                            <i className="bi bi-google me-2"></i>Accedi con Google
                                        </Button>
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