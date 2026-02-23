import logger from '../utils/logger';

const startWorker = async () => {
    logger.info('[*] Report worker started');
    // Implementing long-running periodic tasks or listening to 'report_generation' queue
    // This is a placeholder for generating async large PDF/Excel reports
};

startWorker();
