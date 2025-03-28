import express from 'express';
import passport from 'passport';

const router = express.Router();

// Route per iniziare l'autenticazione Google
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback URL per Google
router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: 'http://localhost:3000/login',
    session: false 
  }),
  (req, res) => {
    // Genera un token JWT o gestisci la sessione come preferisci
    const user = req.user;
    // Rimuovi la password dall'oggetto utente
    const userWithoutPassword = { ...user.toObject() };
    delete userWithoutPassword.password;
    
    // Reindirizza al frontend con i dati dell'utente
    res.redirect(`http://localhost:3000/auth/success?user=${encodeURIComponent(JSON.stringify(userWithoutPassword))}`);
  }
);

export default router; 