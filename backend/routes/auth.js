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
    const token = generateToken(user);
    
    // Prepara i dati utente
    const userData = {
      ...user.toObject(),
      name: `${user.firstName} ${user.lastName}`
    };
    delete userData.password;

    const encodedUser = encodeURIComponent(JSON.stringify(userData));
    const encodedToken = encodeURIComponent(token);

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Autenticazione completata</title>
      </head>
      <body>
        <script>
          try {
            // Salva token
            localStorage.setItem('token', '${token}');
            
            // Salva dati utente
            const userData = ${JSON.stringify(userData)};
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Imposta axios headers se disponibile
            if (window.axios) {
              window.axios.defaults.headers.common['Authorization'] = 'Bearer ${token}';
            }
            
            // Reindirizza
            window.location.href = 'https://epicblogs-kifgyna5o-francescos-projects-302b915e.vercel.app/auth-complete';
          } catch (error) {
            console.error('Errore durante il login:', error);
            window.location.href = 'https://epicblogs-kifgyna5o-francescos-projects-302b915e.vercel.app/login?error=' + encodeURIComponent(error.message);
          }
        </script>
      </body>
      </html>
    `);
  }
);

export default router; 