// Alert worker is currently disabled (RabbitMQ not configured).
// To re-enable, configure RabbitMQ and restore the queue consumer logic.
import logger from '../utils/logger';

logger.info('⚠️  Alert worker is disabled — RabbitMQ is not configured');
