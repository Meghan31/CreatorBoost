import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import passport from 'passport';
import './config/passport';
import authRoutes          from './routes/auth.routes';
import analyticsRoutes     from './routes/analytics.routes';
import aiRoutes            from './routes/ai.routes';
import youtubeRoutes       from './routes/youtube.routes';
import notificationsRoutes from './routes/notifications.routes';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  }),
);
app.use(express.json());
app.use(passport.initialize());

// Health check
app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/v1/auth',          authRoutes);
app.use('/api/v1/analytics',     analyticsRoutes);
app.use('/api/v1/ai',            aiRoutes);
app.use('/api/v1/youtube',       youtubeRoutes);
app.use('/api/v1/notifications', notificationsRoutes);

export default app;
