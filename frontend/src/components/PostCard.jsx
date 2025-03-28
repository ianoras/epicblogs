import React from 'react';
import { Card, Badge, Button, Image } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PostCard = ({ post, showActions = false, onDelete }) => {
  const navigate = useNavigate();
  const { timestamp } = useAuth();
  
  // Ottieni l'URL dell'immagine del profilo
  const profileImage = post.author?.profilePicture 
    ? `${post.author.profilePicture}?t=${timestamp}` 
    : `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${post.author?.firstName}+${post.author?.lastName}`;

  const handleCardClick = (e) => {
    // Evita di navigare se si fa clic sul pulsante di eliminazione
    if (e.target.closest('.card-action-buttons')) {
      e.stopPropagation();
      return;
    }
    navigate(`/posts/${post._id}`);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (window.confirm('Sei sicuro di voler eliminare questo post?')) {
      onDelete(post._id);
    }
  };

  return (
    <Card 
      className="h-100 shadow-sm" 
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      <div style={{ height: '200px', backgroundColor: '#f8f9fa' }}>
        <Card.Img 
          variant="top" 
          src={post.cover} 
          alt={post.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
        />
      </div>
      <Card.Body className="d-flex flex-column">
        <div className="mb-2">
          {post.categories && post.categories.map((category, index) => (
            <Badge 
              key={index} 
              bg="primary" 
              className="me-1 mb-1"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/?category=${category}`);
              }}
            >
              {category}
            </Badge>
          ))}
        </div>
        <Card.Title className="mb-3">
          {post.title}
        </Card.Title>
        <Card.Text>
          {post.content.substring(0, 150)}...
        </Card.Text>
        <div className="mt-auto">
          <div className="d-flex align-items-center">
            <Image 
              src={profileImage} 
              roundedCircle 
              width={40} 
              height={40} 
              className="me-2"
              style={{ objectFit: 'cover' }}
            />
            <div className="ms-2">
              <small className="text-muted d-block">Scritto da</small>
              <span>{post.author ? `${post.author.firstName} ${post.author.lastName}` : 'Autore sconosciuto'}</span>
            </div>
          </div>
          
          {showActions && (
            <div className="card-action-buttons mt-3 d-flex justify-content-end">
              <Button 
                variant="outline-primary" 
                size="sm" 
                className="me-2"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/edit-post/${post._id}`);
                }}
              >
                Modifica
              </Button>
              <Button 
                variant="outline-danger" 
                size="sm"
                onClick={handleDeleteClick}
              >
                Elimina
              </Button>
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}

export default PostCard;