import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { runRAGPipeline } from '../services/rag.js';
import { addClient, removeClient, broadcastMessage } from '../services/sse.js';

const router = express.Router();

const MAX_MESSAGE_LENGTH = 500;

/**
 * POST /api/chat
 * Send a new chat message. If the sender is an agent and uses a
 * RAG-trigger phrase, a knowledge-base article slug is returned.
 */
router.post('/', async (req, res) => {
  try {
    const { text, userRole } = req.body;

    // --- Validation ---
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Field "text" is required and must be a string.' });
    }

    if (text.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    if (text.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        error: `Message exceeds the maximum length of ${MAX_MESSAGE_LENGTH} characters.`,
      });
    }

    if (!userRole || !['client', 'agent'].includes(userRole)) {
      return res
        .status(400)
        .json({ error: 'Field "userRole" must be either "client" or "agent".' });
    }

    // --- Build message object ---
    const message = {
      id: uuidv4(),
      text: text.trim(),
      userRole,
      createdAt: new Date().toISOString(),
      searchResultSlug: null,
    };

    // --- RAG pipeline (only for agent messages) ---
    if (userRole === 'agent') {
      try {
        const slug = await runRAGPipeline(message.text);
        message.searchResultSlug = slug;
      } catch (ragError) {
        // RAG failure should not block the message from being sent
        console.error('⚠️  RAG pipeline error (non-fatal):', ragError.message);
      }
    }

    // --- Broadcast to all SSE clients ---
    broadcastMessage(message);

    return res.status(201).json({
      message,
      searchResultSlug: message.searchResultSlug,
    });
  } catch (err) {
    console.error('Error in POST /api/chat:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

/**
 * GET /api/chat/stream
 * Server-Sent Events endpoint. Clients connect here to receive
 * real-time message broadcasts.
 */
router.get('/stream', (req, res) => {
  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable Nginx buffering
  res.flushHeaders();

  // Retry directive: tell clients to reconnect after 3 seconds on disconnect
  res.write('retry: 3000\n\n');

  // Send a "connected" event immediately so the client knows it's live
  res.write(
    `event: connected\ndata: ${JSON.stringify({ message: 'SSE connection established', timestamp: new Date().toISOString() })}\n\n`,
  );

  // Register this client
  addClient(res);

  // Remove client on disconnect
  req.on('close', () => {
    removeClient(res);
  });
});

export default router;
