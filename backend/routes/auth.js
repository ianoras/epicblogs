import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Aggiungi all'inizio del file
const debug = (msg, ...args) => {
  console.log(`[DEBUG] ${msg}`, ...args);
};

// Funzione per generare il token JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email }, 
    process.env.JWT_SECRET, 
    { expiresIn: '24h' }
  );
};

// Route per iniziare l'autenticazione Google
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback URL per Google
router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: 'https://epicblogs-kifgyna5o-francescos-projects-302b915e.vercel.app/login',
    session: false 
  }),
  (req, res) => {
    const user = req.user;
    const userWithoutPassword = { ...user.toObject() };
    delete userWithoutPassword.password;
    
    // Genera il token JWT
    const token = generateToken(user);
    
    // Prepara i dati utente in formato JSON
    const userData = JSON.stringify(userWithoutPassword);
    
    // Crea l'URL completo per il reindirizzamento con token e dati utente
    const redirectUrl = `https://epicblogs-kifgyna5o-francescos-projects-302b915e.vercel.app/login?user=${encodeURIComponent(userData)}&token=${token}`;
    
    console.log("Reindirizzamento a:", redirectUrl);
    
    // Reindirizza al frontend
    return res.redirect(redirectUrl);
  }
);

export default router; 