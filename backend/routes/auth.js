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
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
    session: false 
  }),
  (req, res) => {
    // Genera un token JWT o gestisci la sessione come preferisci
    const user = req.user;
    // Rimuovi la password dall'oggetto utente
    const userWithoutPassword = { ...user.toObject() };
    delete userWithoutPassword.password;
    
    // Reindirizza al frontend con i dati dell'utente
    res.redirect(`${process.env.FRONTEND_URL}/auth/success?user=${encodeURIComponent(JSON.stringify(userWithoutPassword))}`);
  }
);

// Aggiungi la nuova rotta POST per il login con Google
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    // Verifica il token con Google e ottieni le informazioni dell'utente
    // Implementa la logica di autenticazione
    passport.authenticate('google-token', { session: false }, (err, user) => {
      if (err || !user) {
        return res.status(401).json({ message: 'Autenticazione fallita' });
      }
      // Genera token JWT e invia la risposta
      const token = generateToken(user); // Implementa questa funzione
      res.json({ token, user });
    })(req, res);
  } catch (error) {
    console.error('Errore durante il login con Google:', error);
    res.status(500).json({ message: 'Errore durante il login con Google' });
  }
});

export default router; 