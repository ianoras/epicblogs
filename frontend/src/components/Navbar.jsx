import { useEffect } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NavigationBar = () => {
  const { user, isAuthenticated, logout, login } = useAuth();
  const navigate = useNavigate();

  // Controllo dello stato all'avvio
  useEffect(() => {
    // Verifica se ci sono dati nel localStorage
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr && !isAuthenticated) {
      try {
        const userData = JSON.parse(userStr);
        login(userData, token);
      } catch (error) {
        console.error('Errore nel caricamento dello stato utente:', error);
      }
    }
  }, [isAuthenticated, login]);

  // Debug render
  useEffect(() => {
    console.log('Navbar renderizzata, stato auth:', isAuthenticated);
    if (user) {
      console.log('Utente nella navbar:', user.name);
    }
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">EpicBlogs</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            {isAuthenticated && (
              <>
                <Nav.Link as={Link} to="/create">Crea Post</Nav.Link>
                <Nav.Link as={Link} to="/my-posts">I Miei Post</Nav.Link>
              </>
            )}
          </Nav>
          <Nav>
            {isAuthenticated ? (
              <>
                <span className="navbar-text me-3">
                  Ciao, {user?.name || user?.username || 'Utente'}
                </span>
                <Nav.Link as={Link} to="/profile">Profilo</Nav.Link>
                <Button variant="outline-light" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Accedi</Nav.Link>
                <Nav.Link as={Link} to="/register">Registrati</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;