import app from './app';
import { env } from './config/env';
import logger from './utils/logger';
import { connectRedis } from './config/redis';
import { connectRabbitMQ } from './config/rabbitmq';

const startServer = async () => {
    try {
        logger.info('Starting external services connection...');

        // Connect to Redis
        await connectRedis();

        // Connect to RabbitMQ
        await connectRabbitMQ();

        app.listen(env.PORT, () => {
            logger.info(`Server is running on port ${env.PORT} in ${env.NODE_ENV} mode`);
        });
    } catch (error) {
        logger.error('Failed to start server', error);
        process.exit(1);
    }
};

startServer();
