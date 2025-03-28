import express from 'express';
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';

const router = express.Router();

// GET /comments/:postId - Ottieni tutti i commenti di un post
router.get('/:postId', async (req, res) => {
    try {
        const comments = await Comment.find({ post: req.params.postId })
            .populate('author', 'firstName lastName profilePicture')
            .sort({ createdAt: -1 });
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /comments/:postId - Crea un nuovo commento
router.post('/:postId', async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ message: 'Post non trovato' });
        }

        const comment = new Comment({
            content: req.body.content,
            author: req.body.userId,
            post: req.params.postId
        });

        const savedComment = await comment.save();
        await savedComment.populate('author', 'firstName lastName profilePicture');
        
        res.status(201).json(savedComment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT /comments/:id - Modifica un commento
router.put('/:id', async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Commento non trovato' });
        }

        // Verifica che l'utente sia l'autore del commento
        if (comment.author.toString() !== req.body.userId) {
            return res.status(403).json({ message: 'Non autorizzato' });
        }

        comment.content = req.body.content;
        const updatedComment = await comment.save();
        await updatedComment.populate('author', 'firstName lastName profilePicture');

        res.json(updatedComment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE /comments/:id - Elimina un commento
router.delete('/:id', async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Commento non trovato' });
        }

        // Verifica che l'utente sia l'autore del commento
        if (comment.author.toString() !== req.body.userId) {
            return res.status(403).json({ message: 'Non autorizzato' });
        }

        await comment.deleteOne();
        res.json({ message: 'Commento eliminato con successo' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router; 