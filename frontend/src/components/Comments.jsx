import { useState, useEffect, useCallback } from 'react';
import { Form, Button, ListGroup, Alert, Spinner, Image } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Comments = ({ postId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const { user, timestamp } = useAuth();

    // Funzione helper per ottenere l'URL dell'immagine del profilo
    const getProfileImageUrl = (user) => {
        if (!user) return '';
        if (user.profilePicture) {
            return `${user.profilePicture}?t=${timestamp}`;
        }
        return `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${user.firstName}+${user.lastName}`;
    };

    // Carica i commenti (usando useCallback per memorizzare la funzione)
    const fetchComments = useCallback(async () => {
        if (!postId || postId === 'create') {
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/comments/${postId}`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setComments(response.data);
            setError('');
        } catch (err) {
            console.error('Errore nel caricamento dei commenti:', err);
            setError('Errore nel caricamento dei commenti');
        } finally {
            setLoading(false);
        }
    }, [postId]);

    useEffect(() => {
        fetchComments();
    }, [postId, fetchComments]);

    // Invia un nuovo commento
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            setError('Devi essere autenticato per commentare');
            return;
        }
        
        if (!newComment.trim()) {
            setError('Il commento non può essere vuoto');
            return;
        }
        
        try {
            setError('');
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/comments/${postId}`, {
                content: newComment,
                userId: user._id
            }, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setComments([response.data, ...comments]);
            setNewComment('');
        } catch (err) {
            console.error('Errore nell\'invio del commento:', err);
            setError('Errore nell\'invio del commento');
        }
    };

    // Elimina un commento
    const handleDelete = async (commentId) => {
        if (window.confirm('Sei sicuro di voler eliminare questo commento?')) {
            try {
                await axios.delete(`${process.env.REACT_APP_API_URL}/comments/${commentId}`, {
                    data: { userId: user._id },
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setComments(comments.filter(comment => comment._id !== commentId));
                setError('');
            } catch (err) {
                console.error('Errore nell\'eliminazione del commento:', err);
                setError('Errore nell\'eliminazione del commento');
            }
        }
    };

    return (
        <div className="comments-section">
            <h4 className="mb-4">Commenti ({comments.length})</h4>
            
            {error && <Alert variant="danger">{error}</Alert>}
            
            {user ? (
                <Form onSubmit={handleSubmit} className="comment-form mb-4">
                    <div className="d-flex mb-3">
                        <Image 
                            src={getProfileImageUrl(user)}
                            roundedCircle
                            width={40}
                            height={40}
                            className="me-3"
                            style={{ objectFit: 'cover' }}
                        />
                        <div className="flex-grow-1">
                            <div className="fw-bold">
                                {user.firstName} {user.lastName}
                            </div>
                            <small className="text-muted">
                                Stai commentando come {user.firstName}
                            </small>
                        </div>
                    </div>
                    <Form.Group>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Scrivi un commento..."
                            required
                        />
                    </Form.Group>
                    <div className="text-end">
                        <Button type="submit" className="mt-3">
                            Pubblica commento
                        </Button>
                    </div>
                </Form>
            ) : (
                <Alert variant="info">
                    Effettua il login per lasciare un commento
                </Alert>
            )}

            {loading ? (
                <div className="text-center py-4">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : comments.length > 0 ? (
                <ListGroup variant="flush">
                    {comments.map(comment => (
                        <ListGroup.Item key={comment._id} className="comment-item mb-3 p-3 border rounded">
                            <div className="d-flex justify-content-between">
                                <div className="d-flex mb-2">
                                    <img 
                                        src={comment.author.profilePicture 
                                            ? `${comment.author.profilePicture}?t=${timestamp}` 
                                            : `https://ui-avatars.com/api/?name=${comment.author.firstName}+${comment.author.lastName}&background=0D8ABC&color=fff`} 
                                        alt={`${comment.author.firstName} ${comment.author.lastName}`}
                                        className="rounded-circle me-2"
                                        width="40"
                                        height="40"
                                        style={{ objectFit: 'cover' }}
                                    />
                                    <div>
                                        <div className="fw-bold">{comment.author.firstName} {comment.author.lastName}</div>
                                        <small className="text-muted">
                                            {new Date(comment.createdAt).toLocaleDateString()} 
                                            {comment.createdAt !== comment.updatedAt && " (modificato)"}
                                        </small>
                                    </div>
                                </div>
                                {user && user._id === comment.author._id && (
                                    <div>
                                        <Button 
                                            variant="link" 
                                            className="text-danger p-0 btn-sm" 
                                            onClick={() => handleDelete(comment._id)}
                                        >
                                            <i className="bi bi-trash"></i>
                                        </Button>
                                    </div>
                                )}
                            </div>
                            <div className="mt-2">{comment.content}</div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            ) : (
                <div className="empty-state py-4 text-center">
                    <div className="empty-state-icon fs-1 mb-2">💭</div>
                    <p className="text-muted">Non ci sono ancora commenti. Sii il primo a commentare!</p>
                </div>
            )}
        </div>
    );
};

export default Comments; 