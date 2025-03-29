import { useState, useEffect, useMemo } from 'react';
import { Navbar, Container, Nav, NavDropdown, Image, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const NavigationBar = () => {
  const { user, logout, timestamp } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  
  // Lista di tutte le categorie predefinite (usando useMemo per evitare ricreazione ad ogni render)
  const predefinedCategories = useMemo(() => [
    "Tecnologia", "Viaggi", "Cucina", "Sport", "Salute", 
    "Musica", "Cinema", "Libri", "Arte", "Moda", "Altro"
  ], []);

  // Carica le categorie disponibili
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/posts/categories`);
        
        // Crea un oggetto per mappare le categorie con i loro conteggi
        const categoryCounts = {};
        if (response.data && response.data.categories) {
          response.data.categories.forEach(cat => {
            categoryCounts[cat.name] = cat.count;
          });
        }
        
        // Crea un array con tutte le categorie predefinite e i conteggi (0 se non presenti)
        const allCategories = predefinedCategories.map(name => ({
          name,
          count: categoryCounts[name] || 0
        }));
        
        setCategories(allCategories);
      } catch (error) {
        console.error('Errore nel caricamento delle categorie:', error);
        // Fallback alle categorie predefinite con conteggio 0
        const fallbackCategories = predefinedCategories.map(name => ({ name, count: 0 }));
        setCategories(fallbackCategories);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [predefinedCategories]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Errore durante il logout:', error);
    }
  };

  const navigateToCategory = (categoryName) => {
    navigate(`/?category=${categoryName}`);
  };

  // Usa l'immagine profilo dell'utente se disponibile, altrimenti usa l'avatar generato
  const profileImage = user?.profilePicture 
    ? `${user.profilePicture}?t=${timestamp}` 
    : `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${user?.firstName}+${user?.lastName}`;

  return (
    <Navbar 
      expand="lg" 
      className="navbar-custom py-3"
      style={{
        background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      <Container>
        <Navbar.Toggle 
          aria-controls="basic-navbar-nav" 
          style={{ borderColor: 'white' }}
        />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" onClick={(e) => {
              e.preventDefault();
              navigate('/', { replace: true });
            }}>Home</Nav.Link>
            {user && (
              <Nav.Link as={Link} to="/create">Nuovo Articolo</Nav.Link>
            )}
            
            {/* Menu categorie */}
            <NavDropdown 
              title="Categorie" 
              id="categories-dropdown"
            >
              {loadingCategories ? (
                <NavDropdown.Item disabled>
                  <Spinner animation="border" size="sm" /> Caricamento...
                </NavDropdown.Item>
              ) : categories.length > 0 ? (
                <>
                  {categories.map(category => (
                    <NavDropdown.Item 
                      key={category.name}
                      onClick={() => navigateToCategory(category.name)}
                    >
                      {category.name} {category.count > 0 && <span className="text-muted">({category.count})</span>}
                    </NavDropdown.Item>
                  ))}
                </>
              ) : (
                <NavDropdown.Item disabled>Nessuna categoria disponibile</NavDropdown.Item>
              )}
            </NavDropdown>
          </Nav>
          <Nav>
            {user ? (
              <>
                <div className="d-flex align-items-center">
                  <Image 
                    src={profileImage} 
                    roundedCircle 
                    width={40} 
                    height={40} 
                    className="me-2"
                    style={{ objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.onerror = null; // Previene il loop infinito
                      e.target.src = `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${user.firstName}+${user.lastName}`;
                    }}
                  />
                  <NavDropdown 
                    title={`Ciao, ${user.firstName} ${user.lastName}`}
                    id="basic-nav-dropdown"
                    align="end"
                  >
                    <NavDropdown.Item as={Link} to="/create">
                      Crea Articolo
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/my-posts">
                      I Miei Articoli
                    </NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item as={Link} to="/profile">
                      Gestisci Profilo
                    </NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item onClick={handleLogout}>
                      Logout
                    </NavDropdown.Item>
                  </NavDropdown>
                </div>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;