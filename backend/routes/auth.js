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
    console.log('=== GOOGLE CALLBACK INIZIATO ===');
    const user = req.user;
    const token = generateToken(user);
    
    // Prepara i dati utente
    const userData = {
      ...user.toObject(),
      name: `${user.firstName} ${user.lastName}`
    };
    delete userData.password;

    // Modifica qui: invece di inviare una pagina HTML, reindirizza con i parametri
    const userStr = encodeURIComponent(JSON.stringify(userData));
    const tokenStr = encodeURIComponent(token);
    
    const redirectUrl = `https://epicblogs-kifgyna5o-francescos-projects-302b915e.vercel.app/login?user=${userStr}&token=${tokenStr}`;
    
    console.log('Reindirizzamento a:', redirectUrl.substring(0, 100) + '...');
    res.redirect(redirectUrl);
  }
);

export default router; 