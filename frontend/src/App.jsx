import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import NavigationBar from './components/Navbar';
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import CreatePost from './pages/CreatePost';
import Login from './pages/Login';
import MyPosts from './pages/MyPosts';
import Register from './pages/Register';
import Profile from './pages/Profile';
import { useAuth } from './contexts/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthComplete from './pages/AuthComplete';

function AuthDebugInfo() {
    const { isAuthenticated, user, token } = useAuth();
    
    return (
        <div style={{ 
            position: 'fixed', 
            bottom: '10px', 
            right: '10px', 
            background: '#f0f0f0', 
            padding: '8px', 
            borderRadius: '4px',
            fontSize: '12px',
            zIndex: 9999,
            border: '1px solid #ccc'
        }}>
            Stato: {isAuthenticated ? `✅ Autenticato (${user?.name || user?.username})` : '❌ Non autenticato'}<br/>
            Token: {token ? '✅ Presente' : '❌ Assente'}
        </div>
    );
}

// Funzione per leggere i cookie
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

function AppContent() {
  const { login, user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Verifica se stiamo tornando dall'autenticazione
    if (location.search.includes('auth=true')) {
      toast.success('Autenticazione completata con successo!');
    }

    // Leggi dal cookie
    const tokenFromCookie = getCookie('auth_token');
    const userFromCookie = getCookie('auth_user');
    
    // Leggi da localStorage
    const tokenFromStorage = localStorage.getItem('token');
    const userFromStorage = localStorage.getItem('user');
    
    // Prima prova con i cookie (priorità)
    if (tokenFromCookie && userFromCookie) {
      try {
        const userData = JSON.parse(decodeURIComponent(userFromCookie));
        login(userData, tokenFromCookie);
        console.log('Login effettuato dai cookie');
        return;
      } catch (error) {
        console.error('Errore nel parsing dei cookie:', error);
      }
    }
    
    // Poi prova con localStorage
    if (tokenFromStorage && userFromStorage) {
      try {
        const userData = JSON.parse(userFromStorage);
        login(userData, tokenFromStorage);
        console.log('Login effettuato da localStorage');
      } catch (error) {
        console.error('Errore nel parsing di localStorage:', error);
      }
    }
  }, [login, location]);

  // Debug dello stato di autenticazione
  useEffect(() => {
    console.log('Stato di autenticazione:', !!user);
    if (user) {
      console.log('Utente autenticato:', user.name);
    }
  }, [user]);

  return (
    <div className="d-flex flex-column min-vh-100">
      <NavigationBar />
      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/create" element={<CreatePost />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/my-posts" element={<MyPosts />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/auth-complete" element={<AuthComplete />} />
        </Routes>
      </main>
      <footer className="footer mt-auto">
        <div className="container">
          <div className="row">
            <div className="col-md-4">
              <h5>Chi Siamo</h5>
              <p>Una piattaforma per condividere le tue storie e idee con il mondo.</p>
            </div>
            <div className="col-md-4">
              <h5>Link Utili</h5>
              <ul className="list-unstyled">
                <li><a href="/" className="text-white">Home</a></li>
                <li><a href="/create" className="text-white">Crea Post</a></li>
                <li><a href="/login" className="text-white">Accedi</a></li>
              </ul>
            </div>
            <div className="col-md-4">
              <h5>Contattaci</h5>
              <ul className="list-unstyled">
                <li><a href="mailto:info@example.com" className="text-white">info@example.com</a></li>
                <li><a href="#" className="text-white">Privacy Policy</a></li>
                <li><a href="#" className="text-white">Termini di Servizio</a></li>
              </ul>
            </div>
          </div>
          <hr className="my-4" />
          <div className="text-center">
            <p className="mb-0">&copy; {new Date().getFullYear()} Il Tuo Blog. Tutti i diritti riservati.</p>
          </div>
        </div>
      </footer>
      <AuthDebugInfo />
      <ToastContainer />
    </div>
  );
}

const App = () => {
  return (
    <GoogleOAuthProvider clientId="41646113019-s5als0pklgt17sjdcf0npgtan38dnubo.apps.googleusercontent.com">
      <Router>
        <AppContent />
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App; 