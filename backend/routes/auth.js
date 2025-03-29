import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const router = express.Router();

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
    
    // Imposta il token come cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000 // 24 ore
    });

    // Reindirizza al frontend con i dati dell'utente
    res.redirect(`https://epicblogs-kifgyna5o-francescos-projects-302b915e.vercel.app/auth/success?user=${encodeURIComponent(JSON.stringify(userWithoutPassword))}`);
  }
);

// Route POST per il login con Google (per richieste API dirette)
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    passport.authenticate('google-token', { session: false }, (err, user) => {
      if (err || !user) {
        return res.status(401).json({ message: 'Autenticazione fallita' });
      }
      
      const token = generateToken(user);
      const userWithoutPassword = { ...user.toObject() };
      delete userWithoutPassword.password;

      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000
      });

      res.json({ token, user: userWithoutPassword });
    })(req, res);
  } catch (error) {
    console.error('Errore durante il login con Google:', error);
    res.status(500).json({ message: 'Errore durante il login con Google' });
  }
});

export default router; 