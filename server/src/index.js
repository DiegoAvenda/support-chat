import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './db.js';
import { sendHeartbeat } from './services/sse.js';
import chatRouter from './routes/chat.js';
import articlesRouter from './routes/articles.js';

const app = express();
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(
  cors({
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  }),
);

app.use(express.json({ limit: '10kb' }));

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── API Routes ───────────────────────────────────────────────────────────────

app.use('/api/chat', chatRouter);
app.use('/api/articles', articlesRouter);

// ─── 404 Handler ─────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────

async function bootstrap() {
  try {
    // Connect to MongoDB first
    await connectDB();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`\n🚀 Support Chat Server running on http://localhost:${PORT}`);
      console.log(`   CORS allowed origin: ${CLIENT_URL}`);
      console.log(`   Health check: http://localhost:${PORT}/health\n`);
    });

    // SSE Heartbeat every 25 seconds to keep connections alive
    // (proxies typically timeout at 30s)
    setInterval(sendHeartbeat, 25_000);
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

bootstrap();
