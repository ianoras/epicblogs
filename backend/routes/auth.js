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
    const userWithoutPassword = { ...user.toObject() };
    delete userWithoutPassword.password;
    
    // Genera il token JWT
    const token = generateToken(user);
    
    // Invia una pagina HTML che fa automaticamente il login e reindirizza
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Login completato</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding-top: 50px; }
          .spinner { border: 4px solid rgba(0, 0, 0, 0.1); width: 36px; height: 36px; border-radius: 50%; border-left-color: #09f; animation: spin 1s linear infinite; margin: 20px auto; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <h1>Login completato</h1>
        <p>Reindirizzamento in corso...</p>
        <div class="spinner"></div>
        
        <script>
          console.log("Script di autologin avviato");
          
          // Salva il token
          localStorage.setItem('token', '${token}');
          console.log("Token salvato");
          
          // Salva i dati utente
          const userData = ${JSON.stringify(userWithoutPassword)};
          userData.name = userData.firstName + ' ' + userData.lastName;
          localStorage.setItem('user', JSON.stringify(userData));
          console.log("Dati utente salvati:", userData.firstName, userData.lastName);
          
          // Imposta l'header di autorizzazione per axios se c'è
          if (window.axios) {
            window.axios.defaults.headers.common['Authorization'] = 'Bearer ${token}';
            console.log("Header Authorization impostato");
          }
          
          // Reindirizza alla home
          console.log("Reindirizzamento alla home");
          setTimeout(() => {
            window.location.href = 'https://epicblogs-kifgyna5o-francescos-projects-302b915e.vercel.app/';
          }, 1000);
        </script>
      </body>
      </html>
    `);
  }
);

export default router; 