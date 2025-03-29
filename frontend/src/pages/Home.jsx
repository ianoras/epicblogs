import { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Pagination, Spinner, Form, Alert } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import PostCard from '../components/PostCard';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Lista delle categorie predefinite
  const predefinedCategories = useMemo(() => [
    "Tecnologia", "Viaggi", "Cucina", "Sport", "Salute", 
    "Musica", "Cinema", "Libri", "Arte", "Moda", "Altro"
  ], []);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Estrai la categoria dall'URL se presente
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get('category');
    if (category) {
      setSelectedCategory(category);
    } else {
      setSelectedCategory(''); // Reset della categoria se non ci sono parametri
    }
  }, [location]);

  // Carica i post in base alla categoria selezionata
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        let url = `${process.env.REACT_APP_API_URL}/posts?page=${currentPage}&limit=6`;
        
        if (selectedCategory) {
          url += `&category=${selectedCategory}`;
        }
        
        const response = await axios.get(url, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        setPosts(response.data.posts || []);
        setTotalPages(response.data.totalPages || 1);
        setError(null);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError('Errore nel caricamento dei post');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [currentPage, selectedCategory]);

  // Carica le categorie disponibili
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/posts/categories`, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        // Crea un oggetto per mappare le categorie con i loro conteggi
        const categoryCounts = {};
        if (response.data && response.data.categories) {
          response.data.categories.forEach(cat => {
            categoryCounts[cat.name] = cat.count;
          });
        }
        
        // Crea un array con tutte le categorie predefinite e i conteggi
        const allCategories = predefinedCategories.map(name => ({
          name,
          count: categoryCounts[name] || 0
        }));
        
        setCategories(allCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        const fallbackCategories = predefinedCategories.map(name => ({ name, count: 0 }));
        setCategories(fallbackCategories);
      }
    };
    fetchCategories();
  }, [predefinedCategories]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    navigate(category ? `/?category=${category}` : '/');
  };

  const filteredPosts = Array.isArray(posts) 
    ? posts.filter(post =>
        post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.categories && post.categories.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase())))
      )
    : [];

  return (
    <Container className="py-5">
        {/* Hero Section */}
        <div className="text-center mb-5 fade-in">
            <h1 className="display-4 fw-bold mb-4" style={{ 
                background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
            }}>
                Benvenuto in EpicBlogs
            </h1>
            <p className="lead text-muted">
                Scopri storie interessanti e condividi le tue idee
            </p>
        </div>

        {/* Filtri e Ricerca */}
        <div className="card mb-4 shadow-sm fade-in">
            <div className="card-body">
                <Row className="g-3">
                    <Col md={6}>
                        <Form.Control
                            type="text"
                            placeholder="Cerca negli articoli..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                            style={{
                                borderRadius: '20px',
                                padding: '10px 20px',
                                border: '2px solid #e9ecef',
                                transition: 'all 0.3s ease',
                                ':focus': {
                                    borderColor: '#3498db',
                                    boxShadow: '0 0 0 0.2rem rgba(52, 152, 219, 0.25)'
                                }
                            }}
                        />
                    </Col>
                    <Col md={6}>
                        <Form.Select
                            value={selectedCategory}
                            onChange={(e) => handleCategorySelect(e.target.value)}
                            className="category-select"
                            style={{
                                borderRadius: '20px',
                                padding: '10px 20px',
                                border: '2px solid #e9ecef',
                                transition: 'all 0.3s ease',
                                ':focus': {
                                    borderColor: '#3498db',
                                    boxShadow: '0 0 0 0.2rem rgba(52, 152, 219, 0.25)'
                                }
                            }}
                        >
                            <option value="">Tutte le categorie</option>
                            {categories.map((category) => (
                                <option key={category.name} value={category.name}>
                                    {category.name} ({category.count})
                                </option>
                            ))}
                        </Form.Select>
                    </Col>
                </Row>
            </div>
        </div>

        {/* Lista Post */}
        <Row className="g-4">
            {loading ? (
                <Col xs={12} className="text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Caricamento...</span>
                    </Spinner>
                </Col>
            ) : error ? (
                <Col xs={12} className="text-center">
                    <Alert variant="danger">{error}</Alert>
                </Col>
            ) : filteredPosts.length === 0 ? (
                <Col xs={12} className="text-center">
                    <Alert variant="info">Nessun post trovato</Alert>
                </Col>
            ) : (
                filteredPosts.map((post) => (
                    <Col key={post._id} xs={12} md={6} lg={4}>
                        <PostCard post={post} />
                    </Col>
                ))
            )}
        </Row>

        {/* Paginazione */}
        {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
                <Pagination>
                    <Pagination.First 
                        onClick={() => setCurrentPage(1)} 
                        disabled={currentPage === 1}
                    />
                    <Pagination.Prev 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                        disabled={currentPage === 1}
                    />
                    {[...Array(totalPages)].map((_, index) => (
                        <Pagination.Item
                            key={index + 1}
                            active={index + 1 === currentPage}
                            onClick={() => setCurrentPage(index + 1)}
                        >
                            {index + 1}
                        </Pagination.Item>
                    ))}
                    <Pagination.Next 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                        disabled={currentPage === totalPages}
                    />
                    <Pagination.Last 
                        onClick={() => setCurrentPage(totalPages)} 
                        disabled={currentPage === totalPages}
                    />
                </Pagination>
            </div>
        )}
    </Container>
  );
};

export default Home;