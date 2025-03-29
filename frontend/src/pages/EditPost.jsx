import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Alert, Card, Spinner, Badge } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const EditPost = () => {
    // Lista delle categorie predefinite in ordine alfabetico
    const [predefinedCategories] = useState([
        "Arte", "Cinema", "Cucina", "Libri", "Moda", 
        "Musica", "Salute", "Sport", "Tecnologia", "Viaggi", "Altro"
    ]);

    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [coverImage, setCoverImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [contentLength, setContentLength] = useState(0);
    const [formData, setFormData] = useState({
        title: '',
        categories: [],
        cover: '',
        content: '',
        readTime: {
            value: 5,
            unit: 'minuti'
        }
    });

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/posts/${id}`, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const post = response.data;
                
                if (post.author._id !== user._id) {
                    navigate('/');
                    return;
                }

                // Assicurati che categories sia un array
                const categories = Array.isArray(post.categories) ? post.categories : 
                                    (post.category ? [post.category] : []);

                setFormData({
                    title: post.title,
                    categories: categories,
                    cover: post.cover,
                    content: post.content,
                    readTime: post.readTime
                });
                setContentLength(post.content.length);
                setPreviewUrl(post.cover);
            } catch (err) {
                setError('Errore nel caricamento del post');
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id, user._id, navigate]);

    useEffect(() => {
        setContentLength(formData.content.length);
    }, [formData.content]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // Gestisce la selezione/deselezione delle categorie
    const handleCategoryToggle = (category) => {
        const updatedCategories = [...formData.categories];
        
        if (updatedCategories.includes(category)) {
            // Rimuovi la categoria se già selezionata
            const index = updatedCategories.indexOf(category);
            updatedCategories.splice(index, 1);
        } else {
            // Aggiungi la categoria se non è già selezionata
            updatedCategories.push(category);
        }
        
        setFormData({
            ...formData,
            categories: updatedCategories
        });
    };

    // Gestisce il cambio del valore del tempo di lettura
    const handleReadTimeChange = (e) => {
        const value = parseInt(e.target.value);
        setFormData({
            ...formData,
            readTime: {
                ...formData.readTime,
                value: value
            }
        });
    };

    // Calcola colore del badge del tempo di lettura
    const getReadTimeVariant = (minutes) => {
        if (minutes <= 3) return 'success';
        if (minutes <= 7) return 'info';
        if (minutes <= 10) return 'warning';
        return 'danger';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Controlla se è stata selezionata almeno una categoria
        if (formData.categories.length === 0) {
            setError('Seleziona almeno una categoria');
            return;
        }

        setSaving(true);
        setError('');
        setSuccess('');
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('categories', JSON.stringify(formData.categories));
            formDataToSend.append('content', formData.content);
            formDataToSend.append('readTime', JSON.stringify({
                value: parseInt(formData.readTime.value) || 5,
                unit: "minuti"
            }));

            // Aggiungi l'immagine solo se è stata modificata
            if (coverImage) {
                formDataToSend.append('cover', coverImage);
            }

            const response = await axios.put(
                `${process.env.REACT_APP_API_URL}/posts/${id}`, 
                formDataToSend,
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (response.data) {
                setSuccess('Post aggiornato con successo!');
                setTimeout(() => {
                    navigate(`/posts/${id}`);
                }, 1500);
            }
        } catch (err) {
            console.error('Errore:', err);
            setError(err.response?.data?.message || 'Errore durante l\'aggiornamento del post');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
            <Spinner animation="border" variant="primary" />
        </Container>
    );

    return (
        <Container className="py-5">
            <Card className="shadow-sm border-0">
                <Card.Body className="p-4">
                    <h1 className="text-center mb-4">Modifica Post</h1>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={8}>
                                <Form.Group className="mb-4">
                                    <Form.Label>Titolo</Form.Label>
                                    <Form.Control
                                        type="text"
                                        className="form-control-lg"
                                        placeholder="Inserisci un titolo..."
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label>Immagine di copertina</Form.Label>
                                    <div className="cover-upload-area position-relative mb-3">
                                        {previewUrl && (
                                            <div className="position-relative">
                                                <div className="text-center p-3 border rounded bg-light">
                                                    <img 
                                                        src={previewUrl} 
                                                        alt="Anteprima" 
                                                        className="img-fluid rounded"
                                                        style={{ 
                                                            maxWidth: '100%',
                                                            height: 'auto',
                                                            maxHeight: '400px',
                                                            objectFit: 'contain',
                                                            backgroundColor: '#f8f9fa'
                                                        }}
                                                    />
                                                </div>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    className="position-absolute top-0 end-0 m-2"
                                                    onClick={() => {
                                                        setPreviewUrl("");
                                                        setCoverImage(null);
                                                    }}
                                                >
                                                    <i className="bi bi-x"></i>
                                                </Button>
                                            </div>
                                        )}
                                        <div className={previewUrl ? "mt-3" : "text-center p-4 border rounded bg-light"}>
                                            {!previewUrl && (
                                                <>
                                                    <i className="bi bi-cloud-upload fs-1 text-secondary"></i>
                                                    <p className="mt-2 mb-0">Trascina qui l'immagine o clicca per selezionare</p>
                                                </>
                                            )}
                                            <Form.Control
                                                type="file"
                                                onChange={handleImageChange}
                                                className={previewUrl ? "" : "position-absolute top-0 start-0 opacity-0 w-100 h-100"}
                                                style={{ cursor: 'pointer' }}
                                                accept="image/*"
                                            />
                                        </div>
                                        <Form.Text className="text-muted d-block mt-2">
                                            Formati supportati: JPG, PNG, WebP, GIF. Dimensione massima: 10MB
                                        </Form.Text>
                                    </div>
                                </Form.Group>

                                <Row className="mb-4">
                                    <Col md={12}>
                                        <Form.Group>
                                            <Form.Label>Categorie (seleziona una o più)</Form.Label>
                                            <div className="categories-container p-3 border rounded">
                                                <div className="d-flex flex-wrap gap-2">
                                                    {predefinedCategories.map((category) => (
                                                        <Badge 
                                                            key={category}
                                                            bg="primary"
                                                            text="white"
                                                            className="py-2 px-3 category-badge"
                                                            style={{ 
                                                                cursor: 'pointer',
                                                                opacity: formData.categories.includes(category) ? 1 : 0.6
                                                            }}
                                                            onClick={() => handleCategoryToggle(category)}
                                                        >
                                                            {category}
                                                            {formData.categories.includes(category) && (
                                                                <span className="ms-2">✓</span>
                                                            )}
                                                        </Badge>
                                                    ))}
                                                </div>
                                                {formData.categories.length > 0 && (
                                                    <div className="mt-3">
                                                        <span className="fw-bold">Categorie selezionate:</span>{' '}
                                                        {formData.categories.join(', ')}
                                                    </div>
                                                )}
                                            </div>
                                            <small className="text-muted">
                                                Seleziona tutte le categorie rilevanti per il tuo articolo.
                                            </small>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="mb-4">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Tempo di lettura stimato (minuti)</Form.Label>
                                            <div className="d-flex align-items-center">
                                                <Form.Control
                                                    type="range"
                                                    min="1"
                                                    max="30"
                                                    value={formData.readTime.value}
                                                    onChange={handleReadTimeChange}
                                                    className="me-3"
                                                />
                                                <div className="border rounded px-3 py-2 d-inline-block">
                                                    {formData.readTime.value}
                                                </div>
                                            </div>
                                            <div className="mt-2">
                                                <span className={`badge bg-${getReadTimeVariant(formData.readTime.value)}`}>
                                                    {formData.readTime.value <= 3 ? 'Lettura veloce' : 
                                                    formData.readTime.value <= 7 ? 'Lettura media' : 
                                                    formData.readTime.value <= 10 ? 'Lettura lunga' : 'Lettura molto lunga'}
                                                </span>
                                            </div>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        
                        <Form.Group className="mb-4">
                            <Form.Label>Contenuto</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={12}
                                className="content-editor"
                                placeholder="Inizia a scrivere il tuo post qui..."
                                value={formData.content}
                                onChange={(e) => setFormData({...formData, content: e.target.value})}
                                required
                            />
                            <small className="text-muted d-block mt-2">
                                Lunghezza contenuto: {contentLength} caratteri
                            </small>
                        </Form.Group>
                        
                        <div className="d-flex justify-content-between">
                            <Button 
                                variant="outline-secondary"
                                onClick={() => navigate(`/posts/${id}`)}
                            >
                                Annulla
                            </Button>
                            <Button 
                                type="submit" 
                                variant="primary" 
                                disabled={saving}
                                className="px-4"
                            >
                                {saving ? (
                                    <>
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                            className="me-2"
                                        />
                                        Aggiornamento...
                                    </>
                                ) : (
                                    'Aggiorna post'
                                )}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default EditPost;