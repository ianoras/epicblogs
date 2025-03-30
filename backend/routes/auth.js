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
    console.log('User ricevuto da passport:', user);
    
    const token = generateToken(user);
    console.log('Token generato:', token.substring(0, 20) + '...');
    
    // Prepara i dati utente
    const userData = {
      ...user.toObject(),
      name: `${user.firstName} ${user.lastName}`
    };
    delete userData.password;
    console.log('Dati utente preparati:', userData);

    const encodedUser = encodeURIComponent(JSON.stringify(userData));
    const encodedToken = encodeURIComponent(token);
    
    console.log('=== INVIO RISPOSTA HTML ===');
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Autenticazione completata</title>
        <script>
          console.log('=== SCRIPT DI AUTENTICAZIONE INIZIATO ===');
          try {
            // Salva token
            const token = '${token}';
            console.log('Token da salvare:', token.substring(0, 20) + '...');
            localStorage.setItem('token', token);
            
            // Salva dati utente
            const userData = ${JSON.stringify(userData)};
            console.log('Dati utente da salvare:', userData);
            localStorage.setItem('user', JSON.stringify(userData));
            
            console.log('Dati salvati in localStorage');
            console.log('localStorage.token:', localStorage.getItem('token'));
            console.log('localStorage.user:', localStorage.getItem('user'));
            
            // Reindirizza
            console.log('Reindirizzamento a /auth-complete');
            window.location.href = 'https://epicblogs-kifgyna5o-francescos-projects-302b915e.vercel.app/auth-complete';
          } catch (error) {
            console.error('Errore durante il salvataggio:', error);
            window.location.href = 'https://epicblogs-kifgyna5o-francescos-projects-302b915e.vercel.app/login?error=' + encodeURIComponent(error.message);
          }
        </script>
      </head>
      <body>
        <h3>Autenticazione in corso...</h3>
      </body>
      </html>
    `);
  }
);

export default router; 