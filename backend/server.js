import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import passport from './config/passport.js';
import authRoutes from './routes/auth.js';

//routes
import userRoutes from './routes/users.js';
import postRoutes from './routes/posts.js';
import commentRoutes from './routes/comments.js';
import ratingRoutes from './routes/ratings.js';
import uploadRouter from './routes/upload.js';

// Carica le variabili d'ambiente
dotenv.config();

const app = express();

// Configurazione CORS per permettere le richieste da Google
app.use(cors({
    origin: [
        'http://localhost:3000', 
        'https://accounts.google.com',
        'https://epicblogs-kifgyna5o-francescos-projects-302b915e.vercel.app',
        'https://epicblogs-two.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
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

//URL
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/comments", commentRoutes);
app.use("/auth", authRoutes);
app.use("/ratings", ratingRoutes);
app.use("/upload", uploadRouter);