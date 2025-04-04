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
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    // Gestisce il login con Google quando l'utente ritorna
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const userDataStr = params.get('user');
        const success = params.get('success');
        const error = params.get('error');

        if (error) {
            setError('Errore durante il login con Google');
            return;
        }

        if (userDataStr && success) {
            try {
                // Mostra il loader
                setLoading(true);
                
                const data = JSON.parse(decodeURIComponent(userDataStr));
                
                // Salva il token nel localStorage
                localStorage.setItem('token', data.token);
                
                // Prepara i dati utente
                const user = {
                    ...data,
                    name: `${data.firstName} ${data.lastName}`
                };
                
                // Salva l'utente nel localStorage
                localStorage.setItem('user', JSON.stringify(user));
                
                // Effettua il login
                login(user);
                
                // Usa un timeout per assicurarsi che il login sia completato
                setTimeout(() => {
                    // Usa window.location invece di navigate per un refresh completo
                    window.location.href = '/';
                }, 100);
            } catch (error) {
                console.error('Errore nel parsing dei dati utente:', error);
                setError('Errore durante il login con Google');
                setLoading(false);
            }
        }
    }, [location, login, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/users/login`, formData);
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
            {/* Rimuovi questa sezione di debug */}
            {/* <div className="mb-4 p-3 border rounded bg-light">
                <h5>Debug Info</h5>
                <p>URL: {window.location.href}</p>
                <p>Search Params: {location.search}</p>
                <p>LocalStorage Token: {localStorage.getItem('token') ? 'Presente' : 'Assente'}</p>
                <p>LocalStorage User: {localStorage.getItem('user') ? 'Presente' : 'Assente'}</p>
            </div> */}
            
            {/* Se stiamo processando un login con Google, mostra solo lo spinner */}
            {loading && location.search.includes('user=') ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Completamento autenticazione...</p>
                </div>
            ) : (
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

                                        <Button 
                                            variant="outline-danger" 
                                            onClick={handleGoogleLogin}
                                            className="d-flex align-items-center justify-content-center gap-2"
                                            type="button"
                                            disabled={loading}
                                        >
                                            <i className="bi bi-google"></i>
                                            Accedi con Google
                                        </Button>
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
            )}
        </Container>
    );
};

export default Login;