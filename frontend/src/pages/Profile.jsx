import { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Card, Image, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Profile = () => {
  const { user, updateUser, timestamp } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPreviewUrl(user.profilePicture ? `${user.profilePicture}?t=${timestamp}` : '');
    }
  }, [user, timestamp]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('email', formData.email);
      
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('Le password non coincidono');
        }
        formDataToSend.append('currentPassword', formData.currentPassword);
        formDataToSend.append('newPassword', formData.newPassword);
      }

      if (profileImage) {
        formDataToSend.append('profilePicture', profileImage);
      }

      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/users/profile`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      const updatedUser = {
        ...user,
        ...response.data,
        name: `${response.data.firstName} ${response.data.lastName}`,
        profilePicture: response.data.profilePicture
      };
      updateUser(updatedUser);

      setSuccess('Profilo aggiornato con successo!');
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (err) {
      console.error('Errore aggiornamento profilo:', err);
      setError(err.response?.data?.message || 'Errore durante l\'aggiornamento del profilo');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/users/profile`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      // ... resto del codice
    } catch (error) {
      // ... gestione errori
    }
  };

  const updateProfile = async (data) => {
    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/users/profile`, data, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      // ... resto del codice
    } catch (error) {
      // ... gestione errori
    }
  };

  return (
    <Container className="py-5">
      <Card className="shadow border-0">
        <Card.Body className="p-5">
          <div className="text-center mb-4">
            <h2>Gestisci Profilo</h2>
            <p className="text-muted">Aggiorna le tue informazioni personali</p>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleProfileUpdate}>
            <div className="text-center mb-4">
              <Image
                src={previewUrl || `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${user?.firstName}+${user?.lastName}`}
                roundedCircle
                width={150}
                height={150}
                className="mb-3"
                style={{ objectFit: 'cover' }}
              />
              <Form.Group>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="d-none"
                  id="profile-image"
                />
                <Form.Label htmlFor="profile-image" className="btn btn-outline-primary">
                  Cambia Immagine
                </Form.Label>
              </Form.Group>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Nome</Form.Label>
              <Form.Control
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Cognome</Form.Label>
              <Form.Control
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </Form.Group>

            <div className="mb-4">
              <h4 className="mb-3">Cambia Password</h4>
              <Form.Group className="mb-3">
                <Form.Label>Password Attuale</Form.Label>
                <Form.Control
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Nuova Password</Form.Label>
                <Form.Control
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Conferma Nuova Password</Form.Label>
                <Form.Control
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </Form.Group>
            </div>

            <Button 
              variant="primary" 
              type="submit" 
              className="w-100"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Aggiornamento in corso...
                </>
              ) : (
                'Aggiorna Profilo'
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Profile;