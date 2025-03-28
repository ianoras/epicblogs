import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import Post from '../models/Post.js';
import dotenv from 'dotenv';

// Assicuriamoci che le variabili d'ambiente siano caricate
dotenv.config();

const router = express.Router();

// Configurazione Cloudinary
cloudinary.config({
    cloud_name: 'diwnuzxp1',
    api_key: '541824513543554',
    api_secret: 'U2Xyp6Q4rcVG6alYLxJ0dddt6ik'
});

// Configurazione storage per Multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'blog',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg', 'tiff']
    }
});

const upload = multer({ storage: storage });

// GET tutte le categorie disponibili con conteggio dei post
router.get('/categories', async (req, res) => {
    try {
        // Raccoglie tutte le categorie da tutti i post
        const result = await Post.aggregate([
            // Separa gli array di categorie in documenti singoli
            { $unwind: "$categories" },
            // Raggruppa per categoria e conta
            { $group: { _id: "$categories", count: { $sum: 1 } } },
            // Formatta il risultato
            { $project: { _id: 0, name: "$_id", count: 1 } },
            // Ordina per conteggio (decrescente)
            { $sort: { count: -1 } }
        ]);
        
        res.json({ categories: result });
    } catch (error) {
        console.error('Errore nel recupero delle categorie:', error);
        res.status(500).json({ message: 'Errore nel recupero delle categorie', error: error.message });
    }
});

// GET tutti i post con paginazione
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        let query = {};
        if (req.query.author) {
            query.author = req.query.author;
        }
        
        // Filtraggio per categoria
        if (req.query.category) {
            query.categories = { $in: [req.query.category] };
        }

        const totalPosts = await Post.countDocuments(query);
        const totalPages = Math.ceil(totalPosts / limit);

        const posts = await Post.find(query)
            .populate('author', 'firstName lastName profilePicture')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            posts,
            currentPage: page,
            totalPages,
            totalPosts
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET singolo post
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('author', 'firstName lastName profilePicture');
        if (!post) {
            return res.status(404).json({ message: 'Post non trovato' });
        }
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST nuovo post
router.post('/', upload.single('cover'), async (req, res) => {
    try {
        const { title, content, author } = req.body;
        const readTime = JSON.parse(req.body.readTime);
        const categories = JSON.parse(req.body.categories);

        const post = new Post({
            title,
            content,
            categories,
            author,
            cover: req.file.path,
            readTime
        });

        const savedPost = await post.save();
        await savedPost.populate('author', 'firstName lastName profilePicture');
        res.status(201).json(savedPost);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT aggiorna post
router.put('/:id', upload.single('cover'), async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post non trovato' });
        }

        const updates = {
            title: req.body.title || post.title,
            content: req.body.content || post.content
        };

        // Gestione del readTime
        if (req.body.readTime) {
            try {
                updates.readTime = JSON.parse(req.body.readTime);
            } catch (error) {
                console.error('Errore nel parsing del readTime:', error);
                updates.readTime = post.readTime;
            }
        }

        // Gestione delle categorie
        if (req.body.categories) {
            try {
                updates.categories = JSON.parse(req.body.categories);
            } catch (error) {
                console.error('Errore nel parsing delle categorie:', error);
                updates.categories = post.categories;
            }
        }

        // Gestione dell'immagine di copertina
        if (req.file) {
            updates.cover = req.file.path;
        }

        const updatedPost = await Post.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        ).populate('author', 'firstName lastName profilePicture');

        if (!updatedPost) {
            return res.status(404).json({ message: 'Post non trovato durante l\'aggiornamento' });
        }

        res.json(updatedPost);
    } catch (error) {
        console.error('Errore durante l\'aggiornamento del post:', error);
        res.status(400).json({ 
            message: 'Errore durante l\'aggiornamento del post',
            error: error.message 
        });
    }
});

// DELETE elimina post
router.delete('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post non trovato' });
        }

        // Controllo se è presente il codice admin nella richiesta
        const { adminCode } = req.query;
        
        // Se il codice admin è corretto (123456), consenti l'eliminazione
        if (adminCode === '123456') {
            await post.deleteOne();
            return res.json({ message: 'Post eliminato con successo usando il codice admin' });
        }

        // Altrimenti continua con la logica esistente
        await post.deleteOne();
        res.json({ message: 'Post eliminato con successo' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Aggiungi questa nuova route per cancellazione facilitata tramite GET
router.get('/admin/delete/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post non trovato' });
        }

        // Controllo se è presente il codice admin nella richiesta
        const { adminCode } = req.query;
        
        // Se il codice admin è corretto (123456), consenti l'eliminazione
        if (adminCode === '123456') {
            await post.deleteOne();
            return res.status(200).send(`
                <html>
                <head>
                    <title>Post Eliminato</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
                        .success { color: green; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
                        .btn { display: inline-block; padding: 10px 15px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1 class="success">Post Eliminato con Successo!</h1>
                        <p>Il post con ID: ${post._id} è stato eliminato dal database.</p>
                        <a href="http://localhost:3000" class="btn">Torna alla Home</a>
                    </div>
                </body>
                </html>
            `);
        } else {
            return res.status(401).json({ message: 'Codice admin non valido' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;