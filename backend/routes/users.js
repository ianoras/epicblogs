import express from 'express';
const router = express.Router();
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import User from '../models/User.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import passport from '../config/passport.js';

// Assicuriamoci che le variabili d'ambiente siano caricate
dotenv.config();

// Configurazione Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configurazione storage per Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'blog-profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'tiff']
  }
});

// File upload middleware con dimensione aumentata
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

//GET
router.get("/", async (req, res) => {
    try {
        const users = await User.find().select("-password"); //esclude il campo password
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//POST registrazione
router.post("/register", async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        // Verifica se l'email esiste già
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email già registrata" });
        }

        // Crea username dall'email
        let username = email.split('@')[0];
        
        // Verifica se lo username esiste già
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            // Aggiungi un numero casuale allo username se già esiste
            const randomNum = Math.floor(Math.random() * 1000);
            username = `${username}${randomNum}`;
        }

        // Hash della password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ 
            firstName, 
            lastName, 
            email, 
            password: hashedPassword,
            username
        });
        
        await newUser.save();

        // Non inviare la password nella risposta
        const userWithoutPassword = newUser.toObject();
        delete userWithoutPassword.password;

        res.status(201).json(userWithoutPassword);
    } catch (err) {
        console.error("Errore durante la registrazione:", err.message);
        res.status(500).json({ error: err.message });
    }
});

//POST login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ message: "Utente non trovato" });
        }

        // Verifica la password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: "Password errata" });
        }
        
        // Genera il token JWT
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        
        // Non inviare la password nella risposta
        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;
        
        res.json({ 
            token,
            user: userWithoutPassword 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST upload profile picture
router.post("/:id/upload-profile-picture", upload.single('profilePicture'), async (req, res) => {
  try {
    console.log("Ricevuta richiesta di upload immagine profilo");
    
    if (!req.file) {
      return res.status(400).json({ message: "Nessun file caricato" });
    }
    
    console.log("File caricato su Cloudinary:", req.file);
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: "Utente non trovato" });
    }
    
    // Salva l'URL dell'immagine da Cloudinary
    user.profilePicture = req.file.path;
    await user.save();
    
    // Non inviare la password nella risposta
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    
    res.json(userWithoutPassword);
  } catch (err) {
    console.error("Errore upload immagine:", err.message, err.stack);
    res.status(500).json({ message: "Errore durante il caricamento dell'immagine", error: err.message });
  }
});

// PUT update
router.put("/:id", upload.single('profilePicture'), async (req, res) => {
    try {
      const { firstName, lastName, currentPassword, newPassword } = req.body;
      const user = await User.findById(req.params.id);
  
      if (!user) {
        return res.status(404).json({ message: "Utente non trovato" });
      }
  
      // Verifica password attuale se si sta tentando di cambiarla
      if (newPassword && currentPassword) {
        if (user.password !== currentPassword) {
          return res.status(401).json({ message: "Password attuale non corretta" });
        }
        user.password = newPassword;
      }
  
      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      
      // Aggiorna l'immagine del profilo se è stata caricata
      if (req.file) {
        user.profilePicture = req.file.path;
      }
      
      await user.save();
  
      // Non inviare la password nella risposta
      const userWithoutPassword = user.toObject();
      delete userWithoutPassword.password;
  
      res.json(userWithoutPassword);
    } catch (err) {
      console.error("Errore aggiornamento utente:", err);
      res.status(500).json({ message: "Errore interno durante l'aggiornamento del profilo", error: err.message });
    }
  });

// Rotte per l'autenticazione Google
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/auth/google/callback', 
  passport.authenticate('google', { session: false }),
  (req, res) => {
    try {
      const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET);
      
      // Prepara i dati utente
      const userData = {
        _id: req.user._id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        username: req.user.username,
        profilePicture: req.user.profilePicture,
        token: token
      };
      
      // Redirect all'app frontend
      const userDataStr = encodeURIComponent(JSON.stringify(userData));
      res.redirect(`http://localhost:3000/login?user=${userDataStr}&success=true`);
    } catch (error) {
      console.error('Errore nel callback Google:', error);
      res.redirect('http://localhost:3000/login?error=auth_failed');
    }
  }
);

export default router;