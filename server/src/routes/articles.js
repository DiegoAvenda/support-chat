import express from 'express';
import { getDB } from '../db.js';

const router = express.Router();

/**
 * GET /api/articles/:slug
 * Retrieves a knowledge-base article by its slug from MongoDB.
 */
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ error: 'Invalid slug parameter.' });
    }

    const db = await getDB();
    const collection = db.collection('articulos');

    const article = await collection.findOne(
      { slug },
      { projection: { _id: 0, embedding: 0 } }, // Exclude binary fields from response
    );

    if (!article) {
      return res.status(404).json({ error: `Article with slug "${slug}" not found.` });
    }

    return res.json({ article });
  } catch (err) {
    console.error('Error in GET /api/articles/:slug:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

/**
 * GET /api/articles
 * List all articles (without embeddings).
 */
router.get('/', async (req, res) => {
  try {
    const db = await getDB();
    const collection = db.collection('articulos');

    const articles = await collection
      .find({}, { projection: { _id: 0, embedding: 0 } })
      .toArray();

    return res.json({ articles });
  } catch (err) {
    console.error('Error in GET /api/articles:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
