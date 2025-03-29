import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import passport from './config/passport.js';
import authRoutes from './routes/auth.js';
import session from 'express-session';
import jwt from 'jsonwebtoken';

//routes
import userRoutes from './routes/users.js';
import postRoutes from './routes/posts.js';
import commentRoutes from './routes/comments.js';
import ratingRoutes from './routes/ratings.js';
import uploadRouter from './routes/upload.js';

// Carica le variabili d'ambiente
dotenv.config();

const app = express();

// Aggiorna la configurazione CORS
app.use(cors({
    origin: [
        'http://localhost:3000', 
        'https://accounts.google.com',
        'https://epicblogs-kifgyna5o-francescos-projects-302b915e.vercel.app',
        'https://epicblogs-two.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// Aggiungi/aggiorna la configurazione delle sessioni
app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true, // per HTTPS
        sameSite: 'none', // importante per cross-domain
        maxAge: 24 * 60 * 60 * 1000 // 24 ore
    }
}));

app.use(express.json());

// Inizializza Passport
app.use(passport.initialize());

//Mongo
mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log("Connesso a MongoDB");
        app.listen(process.env.PORT || 3001, () => {
            console.log("Server in ascolto sulla porta", process.env.PORT || 3001);
        });
    })
    .catch((err) => console.log(err));

// Funzione per generare il token JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email }, 
    process.env.JWT_SECRET, 
    { expiresIn: '24h' }
  );
};

// Aggiungi questa route specifica prima delle altre route
app.get('/users/auth/google/callback', 
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
    res.redirect(`https://epicblogs-kifgyna5o-francescos-projects-302b915e.vercel.app/login?user=${encodeURIComponent(JSON.stringify(userWithoutPassword))}`);
  }
);

// Aggiungi prima di app.use("/users", userRoutes), app.use("/posts", postRoutes), ecc.
app.get('/users/auth/google/callback', (req, res) => {
  // Reindirizza a /auth/google/callback mantenendo i parametri
  const queryParams = req.url.split('?')[1] || '';
  res.redirect(`/auth/google/callback${queryParams ? '?' + queryParams : ''}`);
});

// Le altre route
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/comments", commentRoutes);
app.use("/auth", authRoutes);
// Aggiungi questa linea per montare le routes di auth anche su /users/auth
app.use("/users/auth", authRoutes);
app.use("/ratings", ratingRoutes);
app.use("/upload", uploadRouter);