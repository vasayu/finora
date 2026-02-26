import app from './app';
import { env } from './config/env';
import logger from './utils/logger';

const startServer = async () => {
    try {
        logger.info('Starting Finora server...');

        app.listen(env.PORT, () => {
            logger.info(`🚀 Server is running on port ${env.PORT} in ${env.NODE_ENV} mode`);
            logger.info(`📡 API available at http://localhost:${env.PORT}/api/v1`);
        });
    } catch (error) {
        logger.error('Failed to start server', error);
        process.exit(1);
    }
};

startServer();
