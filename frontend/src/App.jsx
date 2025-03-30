import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Componente per forzare l'inizializzazione dell'auth
function InitAuth() {
  const { login } = useAuth();
  
  useEffect(() => {
    console.log('InitAuth: Verifica localStorage');
    // Controlla se ci sono dati nel localStorage
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        const userData = JSON.parse(userStr);
        console.log('InitAuth: Dati trovati, avvio login con', userData.name);
        login(userData, token);
      } else {
        console.log('InitAuth: Nessun dato trovato in localStorage');
      }
    } catch (error) {
      console.error('InitAuth: Errore durante l\'inizializzazione', error);
    }
  }, [login]);
  
  return null;
}

const App = () => {
  return (
    <GoogleOAuthProvider clientId="41646113019-s5als0pklgt17sjdcf0npgtan38dnubo.apps.googleusercontent.com">
      <Router>
        <div className="d-flex flex-column min-vh-100">
          <InitAuth />
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
          <ToastContainer />
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App; 