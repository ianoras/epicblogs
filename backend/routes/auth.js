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
    failureRedirect: 'https://epicblogs-two.vercel.app/login',
    session: false 
  }),
  (req, res) => {
    // Genera un token JWT
    const user = req.user;
    const token = generateToken(user);
    
    // Rimuovi la password dall'oggetto utente
    const userWithoutPassword = { ...user.toObject() };
    delete userWithoutPassword.password;
    
    // Aggiungi il token all'oggetto utente
    userWithoutPassword.token = token;
    
    // Reindirizza al frontend con i dati dell'utente
    console.log('Reindirizzamento a frontend con dati utente');
    res.redirect(`https://epicblogs-two.vercel.app/login?success=true&user=${encodeURIComponent(JSON.stringify(userWithoutPassword))}`);
  }
);

// Aggiungi un nuovo endpoint per recuperare i dati temporanei
router.get('/temp-auth/:token', (req, res) => {
  const { token } = req.params;
  console.log('Richiesta dati temporanei con token:', token);
  
  if (!global.tempAuthData || token !== "tmp_" + token.split('_')[1]) {
    console.log('Token temporaneo non valido o scaduto');
    return res.status(401).json({ error: 'Token non valido o scaduto' });
  }
  
  if (global.tempAuthData.expires < Date.now()) {
    console.log('Token temporaneo scaduto');
    delete global.tempAuthData;
    return res.status(401).json({ error: 'Token scaduto' });
  }
  
  const authData = { ...global.tempAuthData };
  delete global.tempAuthData; // Usa una sola volta
  
  console.log('Dati temporanei inviati al client');
  res.json({
    user: authData.user,
    token: authData.token
  });
});

export default router; 