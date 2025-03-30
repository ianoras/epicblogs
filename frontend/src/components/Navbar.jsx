import { useEffect, useState } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NavigationBar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  // Verifica stato autenticazione all'avvio
  useEffect(() => {
    // Verifica manuale se localStorage ha dati
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        console.log('Dati utente trovati nel localStorage:', userData.name);
      } catch (error) {
        console.error('Errore nel parsing dei dati utente:', error);
      }
    } else {
      console.log('Nessun dato utente trovato nel localStorage');
    }
    
    console.log('Navbar: stato autenticazione =', isAuthenticated);
    console.log('Navbar: user =', user);
    setChecked(true);
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Determina i link da mostrare in base all'autenticazione
  const renderAuthLinks = () => {
    // Verifica manuale
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const hasLocalAuth = !!(token && userStr);
    
    // Usa sia isAuthenticated che il controllo manuale
    const isUserAuth = isAuthenticated || hasLocalAuth;
    
    if (isUserAuth) {
      let userName = 'Utente';
      if (user) {
        userName = user.name || user.username;
      } else if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          userName = userData.name || userData.username;
        } catch (error) {
          console.error('Errore nel parsing del nome utente:', error);
        }
      }
      
      return (
        <>
          <span className="navbar-text me-3">
            Ciao, {userName}
          </span>
          <Nav.Link as={Link} to="/profile">Profilo</Nav.Link>
          <Button variant="outline-light" onClick={handleLogout}>Logout</Button>
        </>
      );
    } else {
      return (
        <>
          <Nav.Link as={Link} to="/login">Accedi</Nav.Link>
          <Nav.Link as={Link} to="/register">Registrati</Nav.Link>
        </>
      );
    }
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">EpicBlogs</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            {(isAuthenticated || localStorage.getItem('token')) && (
              <>
                <Nav.Link as={Link} to="/create">Crea Post</Nav.Link>
                <Nav.Link as={Link} to="/my-posts">I Miei Post</Nav.Link>
              </>
            )}
          </Nav>
          <Nav>
            {renderAuthLinks()}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;