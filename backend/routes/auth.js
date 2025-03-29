import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const router = express.Router();

// Funzione per generare il token JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email }, 
    process.env.JWT_SECRET, 
    { expiresIn: '24h' }
  );
};

// Configura il client Google
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

    // Invia una pagina HTML che invia un messaggio alla finestra principale
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Autenticazione completata</title>
      </head>
      <body>
        <h1>Autenticazione completata</h1>
        <p>Puoi chiudere questa finestra ora.</p>
        <script>
          window.opener.postMessage({
            type: 'AUTH_SUCCESS',
            user: ${JSON.stringify(userWithoutPassword)},
            token: '${token}'
          }, '*');
          window.close();
        </script>
      </body>
      </html>
    `);
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

// Nuova route per la verifica del token Google
router.post('/google-token', async (req, res) => {
  try {
    const { credential } = req.body;
    
    // Verifica il token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const { email, given_name, family_name, picture, sub } = payload;
    
    // Cerca l'utente nel database
    let user = await User.findOne({ email });
    
    if (!user) {
      // Crea un nuovo utente
      user = new User({
        email,
        firstName: given_name,
        lastName: family_name,
        profilePicture: picture,
        googleId: sub,
        username: email.split('@')[0]
      });
      await user.save();
    } else if (!user.googleId) {
      // Aggiorna l'utente esistente
      user.googleId = sub;
      user.profilePicture = picture;
      if (!user.firstName) user.firstName = given_name;
      if (!user.lastName) user.lastName = family_name;
      await user.save();
    }
    
    // Genera il token JWT
    const token = generateToken(user);
    
    // Invia la risposta
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    
    res.json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Errore nella verifica del token Google:', error);
    res.status(401).json({ message: 'Token non valido' });
  }
});

export default router; 