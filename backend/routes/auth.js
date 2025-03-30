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

    // Invece di reindirizzare con parametri URL, invia una pagina HTML con script
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Autenticazione in corso...</title>
        </head>
        <body>
          <h3>Autenticazione completata, reindirizzamento in corso...</h3>
          <script>
            try {
              // Salva i dati nel localStorage
              const token = '${token}';
              const userData = ${JSON.stringify(userData)};
              
              window.localStorage.setItem('token', token);
              window.localStorage.setItem('user', JSON.stringify(userData));
              
              // Reindirizza alla home
              window.location.href = 'https://epicblogs-kifgyna5o-francescos-projects-302b915e.vercel.app/';
            } catch (error) {
              console.error('Errore:', error);
              window.location.href = 'https://epicblogs-kifgyna5o-francescos-projects-302b915e.vercel.app/login?error=' + encodeURIComponent(error.message);
            }
          </script>
        </body>
      </html>
    `);
  }
);

export default router; 