import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import dotenv from 'dotenv';

// Carica le variabili d'ambiente
dotenv.config();

// Configurazione Passport Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://epicblogs.onrender.com/users/auth/google/callback",
    scope: ['profile', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Cerca l'utente nel database
      let user = await User.findOne({ email: profile.emails[0].value });
      
      // Estrai firstName e lastName dal displayName
      const nameParts = profile.displayName.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || firstName; // Se non c'è un cognome, usa il nome come cognome

      if (!user) {
        // Se l'utente non esiste, crealo
        user = new User({
          email: profile.emails[0].value,
          username: profile.emails[0].value.split('@')[0],
          firstName: firstName,
          lastName: lastName,
          profilePicture: profile.photos[0].value,
          googleId: profile.id
        });
        await user.save();
      } else if (!user.googleId) {
        // Se l'utente esiste ma non ha googleId, aggiornalo
        user.googleId = profile.id;
        user.profilePicture = profile.photos[0].value;
        // Aggiorna firstName e lastName se non sono presenti
        if (!user.firstName) user.firstName = firstName;
        if (!user.lastName) user.lastName = lastName;
        await user.save();
      }
      
      done(null, user);
    } catch (error) {
      console.error('Errore durante l\'autenticazione Google:', error);
      done(error, null);
    }
  }
));

// Serializzazione dell'utente
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserializzazione dell'utente
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport; 