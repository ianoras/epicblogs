import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Alert, Image, Badge, Card, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Comments from '../components/Comments';
import StarRating from '../components/StarRating';
import axios from 'axios';

const PostDetails = () => {
    const [post, setPost] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rating, setRating] = useState(0);
    const [totalRatings, setTotalRatings] = useState(0);
    const [averageRating, setAverageRating] = useState(0);
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, timestamp } = useAuth();
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        // Se non c'è un ID o l'ID è 'create', reindirizza alla home
        if (!id || id === 'create') {
            navigate('/');
            return;
        }

        const fetchPost = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:3001/posts/${id}`);
                setPost(response.data);
                setError(null);
            } catch (error) {
                console.error('Error fetching post:', error);
                setError('Errore nel caricamento del post');
            } finally {
                setLoading(false);
            }
        };

        const fetchRatingStats = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/ratings/${id}/rating`);
                setTotalRatings(response.data.totalRatings);
                setAverageRating(response.data.averageRating);
            } catch (error) {
                console.error('Errore nel caricamento delle statistiche:', error);
            }
        };

        const fetchUserRating = async () => {
            if (!user) return;
            
            try {
                const response = await axios.get(`http://localhost:3001/ratings/${id}/rating/${user._id}`);
                setRating(response.data.rating);
            } catch (error) {
                console.error('Errore nel caricamento della valutazione utente:', error);
            }
        };

        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
        };

        // Chiama le funzioni di fetch
        fetchPost();
        fetchRatingStats();
        fetchUserRating();

        // Aggiungi l'event listener per lo scroll
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [id, user, navigate]);

    const handleRatingChange = async (newRating) => {
        if (!user) {
            alert('Devi essere loggato per valutare un post');
            return;
        }

        try {
            await axios.post(`http://localhost:3001/ratings/${id}/rating`, {
                userId: user._id,
                rating: newRating
            });
            setRating(newRating);
            // Ricarica le statistiche
            const response = await axios.get(`http://localhost:3001/ratings/${id}/rating`);
            setTotalRatings(response.data.totalRatings);
            setAverageRating(response.data.averageRating);
        } catch (error) {
            console.error('Errore durante l\'aggiornamento della valutazione:', error);
            setError('Errore durante l\'aggiornamento della valutazione');
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Sei sicuro di voler eliminare questo post?')) {
            try {
                await axios.delete(`http://localhost:3001/posts/${id}`);
                navigate('/my-posts');
            } catch (err) {
                setError('Errore durante l\'eliminazione del post');
            }
        }
    };

    // Verifica se l'utente è l'autore del post
    const isAuthor = user && post.author && user._id === post.author._id;

    // Formatta la data in modo leggibile
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('it-IT', options);
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <Container className="py-5">
            {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : error ? (
                <Alert variant="danger">{error}</Alert>
            ) : post && post._id ? (
                <Card className="border-0 shadow-sm overflow-hidden">
                    <Card.Body className="p-0">
                        <Row className="g-0">
                            {/* Header con informazioni principali */}
                            <Col xs={12} className="p-4 pb-0">
                                <div className="d-flex justify-content-between align-items-start flex-wrap">
                                    <div className="mb-3">
                                        <div className="d-flex flex-wrap mb-3">
                                            {post.categories && post.categories.map((category, index) => (
                                                <Badge 
                                                    key={index} 
                                                    bg="primary" 
                                                    className="me-2 mb-2 py-2 px-3"
                                                    onClick={() => navigate(`/?category=${category}`)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {category}
                                                </Badge>
                                            ))}
                                        </div>
                                        <h1 className="display-5 fw-bold mb-3">{post.title}</h1>
                                    </div>
                                    {isAuthor && (
                                        <div className="ms-auto d-flex mb-3">
                                            <Button 
                                                variant="outline-primary" 
                                                className="me-2"
                                                onClick={() => navigate(`/edit-post/${post._id}`)}
                                            >
                                                <i className="bi bi-pencil me-1"></i>
                                                Modifica
                                            </Button>
                                            <Button 
                                                variant="outline-danger"
                                                onClick={handleDelete}
                                            >
                                                <i className="bi bi-trash me-1"></i>
                                                Elimina
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Autore e info di pubblicazione */}
                                <div className="mb-4 d-flex align-items-center">
                                    <Image 
                                        src={post.author?.profilePicture 
                                            ? `${post.author.profilePicture}?t=${timestamp}` 
                                            : `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${post.author?.firstName}+${post.author?.lastName}`}
                                        roundedCircle
                                        width={50}
                                        height={50}
                                        className="me-3"
                                        style={{ objectFit: 'cover', border: '2px solid #007bff' }}
                                    />
                                    <div>
                                        <div className="fw-bold">
                                            {post.author?.firstName} {post.author?.lastName}
                                        </div>
                                        <div className="d-flex align-items-center text-muted small">
                                            <span className="me-3">
                                                <i className="bi bi-calendar me-1"></i>
                                                {formatDate(post.createdAt)}
                                            </span>
                                            <span>
                                                <i className="bi bi-clock me-1"></i>
                                                {post.readTime?.value} {post.readTime?.unit} di lettura
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                            
                            {/* Immagine di copertina a tutta larghezza */}
                            <Col xs={12} className="mb-4">
                                <div className="post-cover-container" style={{ 
                                    maxHeight: '400px', 
                                    overflow: 'hidden',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}>
                                    <img 
                                        src={post.cover} 
                                        alt={post.title} 
                                        className="img-fluid w-100"
                                        style={{ 
                                            objectFit: 'contain',
                                            maxHeight: '400px',
                                            width: '100%',
                                            display: 'block'
                                        }}
                                    />
                                </div>
                            </Col>
                            
                            {/* Contenuto del post */}
                            <Col xs={12} className="px-4 px-md-5">
                                <Row>
                                    <Col lg={10} className="mx-auto">
                                        <div className="post-content">
                                            {post.content.split('\n').map((paragraph, index) => (
                                                paragraph ? (
                                                    <p key={index} className="fs-5 mb-4 text-justify">{paragraph}</p>
                                                ) : (
                                                    <br key={index} />
                                                )
                                            ))}
                                        </div>
                                        
                                        {/* Sezione valutazione */}
                                        <div className="d-flex justify-content-between align-items-center my-5 py-4 border-top border-bottom">
                                            <div className="d-flex align-items-center">
                                                <span className="me-3">Valuta:</span>
                                                <StarRating 
                                                    rating={rating} 
                                                    onRatingChange={handleRatingChange}
                                                    readOnly={!user}
                                                />
                                                <span className="ms-3 text-muted">
                                                    {averageRating.toFixed(1)} ({totalRatings} {totalRatings === 1 ? 'valutazione' : 'valutazioni'})
                                                </span>
                                            </div>
                                            <Button 
                                                variant="primary" 
                                                onClick={() => window.scrollTo({
                                                    top: document.getElementById('comments-section').offsetTop - 100,
                                                    behavior: 'smooth'
                                                })}
                                            >
                                                <i className="bi bi-chat-text me-1"></i>
                                                Commenta
                                            </Button>
                                        </div>
                                    </Col>
                                </Row>
                            </Col>
                            
                            {/* Sezione commenti */}
                            <Col xs={12} className="px-4 px-md-5 pb-5" id="comments-section">
                                <Row>
                                    <Col lg={10} className="mx-auto">
                                        <Comments postId={id} />
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            ) : (
                <Alert variant="info">
                    Post non trovato. <Button variant="link" onClick={() => navigate('/')}>Torna alla home</Button>
                </Alert>
            )}

            {/* Pulsante Scroll to Top */}
            {showScrollTop && (
                <div className="scroll-to-top" onClick={scrollToTop}>
                    <i className="bi bi-arrow-up"></i>
                </div>
            )}
        </Container>
    );
};

export default PostDetails;