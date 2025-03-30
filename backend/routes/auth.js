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
    failureRedirect: 'https://epicblogs-two.vercel.app/login?error=auth_failed',
    session: false 
  }),
  (req, res) => {
    console.log('=== GOOGLE CALLBACK INIZIATO ===');
    const user = req.user;
    const token = generateToken(user);
    
    console.log('Token generato:', token.substring(0, 20) + '...');
    console.log('User ID:', user._id);
    
    try {
      // Rimuovi qualsiasi informazione sensibile
      const userData = {
        _id: user._id.toString(),
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        role: user.role,
        name: `${user.firstName} ${user.lastName}`
      };
      
      // Codifica come JSON
      const userJson = JSON.stringify(userData).replace(/"/g, '\\"');
      
      console.log('Dati utente preparati, reindirizzamento alla pagina di auth');
      
      // Invia una pagina HTML estremamente semplice
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Autenticazione completata</title>
          </head>
          <body>
            <h2>Autenticazione completata!</h2>
            <p>Reindirizzamento alla home...</p>
            <script>
              // Salva i dati
              localStorage.setItem("token", "${token}");
              localStorage.setItem("user", "${userJson}");
              
              // Reindirizza immediatamente
              window.location.href = "https://epicblogs-two.vercel.app/";
            </script>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('Errore nel callback Google:', error);
      res.redirect('https://epicblogs-two.vercel.app/login?error=' + encodeURIComponent(error.message));
    }
  }
);

export default router; 