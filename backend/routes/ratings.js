import express from 'express';
import Post from '../models/Post.js';

const router = express.Router();

// Ottieni la valutazione media e il numero totale di valutazioni per un post
router.get('/:postId/rating', async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ message: 'Post non trovato' });
        }

        const ratings = post.ratings || [];
        const totalRatings = ratings.length;
        const averageRating = totalRatings > 0
            ? ratings.reduce((acc, curr) => acc + curr.rating, 0) / totalRatings
            : 0;

        res.json({
            averageRating,
            totalRatings
        });
    } catch (error) {
        res.status(500).json({ message: 'Errore nel recupero della valutazione', error: error.message });
    }
});

// Ottieni la valutazione di un utente specifico per un post
router.get('/:postId/rating/:userId', async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ message: 'Post non trovato' });
        }

        const userRating = post.ratings.find(rating => rating.userId.toString() === req.params.userId);
        res.json({ rating: userRating ? userRating.rating : 0 });
    } catch (error) {
        res.status(500).json({ message: 'Errore nel recupero della valutazione', error: error.message });
    }
});

// Aggiungi o aggiorna una valutazione
router.post('/:postId/rating', async (req, res) => {
    try {
        const { userId, rating } = req.body;
        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({ message: 'Post non trovato' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'La valutazione deve essere compresa tra 1 e 5' });
        }

        // Inizializza l'array ratings se non esiste
        if (!post.ratings) {
            post.ratings = [];
        }

        const existingRatingIndex = post.ratings.findIndex(r => r.userId.toString() === userId);

        if (existingRatingIndex >= 0) {
            // Aggiorna la valutazione esistente
            post.ratings[existingRatingIndex].rating = rating;
        } else {
            // Aggiungi una nuova valutazione
            post.ratings.push({ userId, rating });
        }

        await post.save();
        res.json({ message: 'Valutazione aggiornata con successo' });
    } catch (error) {
        res.status(500).json({ message: 'Errore nell\'aggiornamento della valutazione', error: error.message });
    }
});

export default router; 