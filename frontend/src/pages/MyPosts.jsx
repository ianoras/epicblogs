import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const MyPosts = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMyPosts = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/posts?author=${user._id}`, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setPosts(response.data.posts);
                setError(null);
            } catch (error) {
                console.error('Errore nel caricamento dei post:', error);
                setError('Errore nel caricamento dei tuoi post');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchMyPosts();
        } else {
            navigate('/login');
        }
    }, [user, navigate]);

    const handleDelete = async (postId) => {
        if (window.confirm('Sei sicuro di voler eliminare questo post?')) {
            try {
                await axios.delete(`${process.env.REACT_APP_API_URL}/posts/${postId}`, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setPosts(posts.filter(post => post._id !== postId));
            } catch (error) {
                console.error('Errore nell\'eliminazione del post:', error);
                setError('Errore nell\'eliminazione del post');
            }
        }
    };

    if (loading) {
        return (
            <Container className="py-5">
                <div className="text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Caricamento...</span>
                    </Spinner>
                </div>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <h2 className="mb-4">I Miei Post</h2>

            {error && (
                <Alert variant="danger" className="mb-4">
                    {error}
                </Alert>
            )}

            {posts.length === 0 ? (
                <Alert variant="info">
                    Non hai ancora creato nessun post.
                    <Link to="/create" className="alert-link ms-2">
                        Crea il tuo primo post
                    </Link>
                </Alert>
            ) : (
                <Row className="g-4">
                    {posts.map(post => (
                        <Col key={post._id} md={6} lg={4}>
                            <Card className="h-100">
                                {post.cover && (
                                    <Card.Img 
                                        variant="top" 
                                        src={post.cover} 
                                        alt={post.title}
                                        style={{ height: '200px', objectFit: 'cover' }}
                                    />
                                )}
                                <Card.Body>
                                    <Card.Title>{post.title}</Card.Title>
                                    <Card.Text>
                                        {post.content.substring(0, 150)}...
                                    </Card.Text>
                                    <div className="d-flex justify-content-end gap-2">
                                        <Button 
                                            variant="outline-primary" 
                                            size="sm"
                                            onClick={() => navigate(`/edit-post/${post._id}`)}
                                        >
                                            <i className="bi bi-pencil me-1"></i>
                                            Modifica
                                        </Button>
                                        <Button 
                                            variant="outline-danger" 
                                            size="sm"
                                            onClick={() => handleDelete(post._id)}
                                        >
                                            <i className="bi bi-trash me-1"></i>
                                            Elimina
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default MyPosts;