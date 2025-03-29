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

        if (userDataStr) {
            try {
                const userData = JSON.parse(decodeURIComponent(userDataStr));
                console.log('Dati utente ricevuti:', userData);
                
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
        // Forza l'URL di produzione
        window.location.href = `https://epicblogs.onrender.com/users/auth/google`;
    };

    return (
        <Container className="py-5">
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
        </Container>
    );
};

export default Login;