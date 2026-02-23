import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middleware/error.middleware';
import logger from './utils/logger';

import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import organizationsRoutes from './modules/organizations/organizations.routes';
import documentsRoutes from './modules/documents/documents.routes';
import transactionsRoutes from './modules/transactions/transactions.routes';
import financialsRoutes from './modules/financials/financials.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import alertsRoutes from './modules/alerts/alerts.routes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(
    morgan(morganFormat, {
        stream: { write: (message) => logger.info(message.trim()) },
    })
);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/organizations', organizationsRoutes);
app.use('/api/v1/documents', documentsRoutes);
app.use('/api/v1/transactions', transactionsRoutes);
app.use('/api/v1/financials', financialsRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/alerts', alertsRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
