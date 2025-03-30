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

    // Invia una pagina HTML che salva i dati e reindirizza
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Autenticazione in corso...</title>
          <script>
            function completeAuth() {
              try {
                // Salva token e user nei cookies (più affidabile su alcuni browser)
                document.cookie = "auth_token=${token}; path=/; max-age=86400; SameSite=None; Secure";
                document.cookie = "auth_user=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=86400; SameSite=None; Secure";
                
                // Salva anche in localStorage come backup
                localStorage.setItem('token', '${token}');
                localStorage.setItem('user', JSON.stringify(${JSON.stringify(userData)}));
                
                // Debug info
                console.log('Token salvato nei cookie e localStorage');
                console.log('User salvato nei cookie e localStorage');
                
                // Reindirizza con parametri extra per sicurezza
                window.location.href = 'https://epicblogs-kifgyna5o-francescos-projects-302b915e.vercel.app/?auth=true&ts=' + Date.now();
              } catch (error) {
                console.error('Errore durante il salvataggio:', error);
                alert('Si è verificato un errore durante l\'autenticazione: ' + error.message);
                window.location.href = 'https://epicblogs-kifgyna5o-francescos-projects-302b915e.vercel.app/login?error=' + encodeURIComponent(error.message);
              }
            }
          </script>
        </head>
        <body onload="setTimeout(completeAuth, 500)">
          <h2>Autenticazione completata!</h2>
          <p>Salvataggio dati e reindirizzamento in corso...</p>
          <button onclick="completeAuth()">Clicca qui se non vieni reindirizzato automaticamente</button>
        </body>
      </html>
    `);
  }
);

export default router; 