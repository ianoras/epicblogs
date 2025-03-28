import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavigationBar from './components/Navbar';
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import CreatePost from './pages/CreatePost';
import Login from './pages/Login';
import MyPosts from './pages/MyPosts';
import Register from './pages/Register';
import Profile from './pages/Profile';

const App = () => {
    return (
        <Router>
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
            </div>
        </Router>
    );
};

export default App; 