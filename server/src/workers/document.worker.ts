import amqplib from 'amqplib';
import { env } from '../config/env';
import { prisma } from '../config/database';
import logger from '../utils/logger';

const startWorker = async () => {
    try {
        const connection = await amqplib.connect(env.RABBITMQ_URL);
        const channel = await connection.createChannel();

        const queue = 'document_processing';
        await channel.assertQueue(queue, { durable: true });

        logger.info(`[*] Waiting for messages in ${queue}.`);

        channel.consume(queue, async (msg) => {
            if (msg !== null) {
                try {
                    const content = JSON.parse(msg.content.toString());
                    logger.info(`Received document for processing: ${content.documentId}`);

                    await prisma.document.update({
                        where: { id: content.documentId },
                        data: { status: 'PROCESSING' }
                    });

                    // Simulate processing delay and data extraction
                    await new Promise(resolve => setTimeout(resolve, 5000));

                    // Dummy extracted data
                    const extractedData = {
                        merchant: "Dummy Merchant LLC",
                        amount: 1250.00,
                        date: new Date().toISOString()
                    };

                    await prisma.document.update({
                        where: { id: content.documentId },
                        data: { status: 'COMPLETED', extractedData }
                    });

                    logger.info(`Completed document processing: ${content.documentId}`);
                    channel.ack(msg);
                } catch (err) {
                    logger.error('Error processing document message', err);
                    // depending on the error, we might nack to requeue
                    channel.nack(msg, false, false);
                }
            }
        });
    } catch (error) {
        logger.error('Failed to start document worker', error);
        process.exit(1);
    }
};

startWorker();
