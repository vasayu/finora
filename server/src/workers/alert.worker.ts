import amqplib from 'amqplib';
import { env } from '../config/env';
import { prisma } from '../config/database';
import logger from '../utils/logger';

const startWorker = async () => {
    try {
        const connection = await amqplib.connect(env.RABBITMQ_URL);
        const channel = await connection.createChannel();

        const queue = 'alert_notifications';
        await channel.assertQueue(queue, { durable: true });

        logger.info(`[*] Waiting for messages in ${queue}.`);

        channel.consume(queue, async (msg) => {
            if (msg !== null) {
                try {
                    const content = JSON.parse(msg.content.toString());
                    logger.info(`Received alert: ${content.type}`);

                    await prisma.alert.create({
                        data: {
                            type: content.type,
                            message: content.message,
                            userId: content.userId,
                        }
                    });

                    logger.info(`Alert saved to DB for user: ${content.userId}`);
                    channel.ack(msg);
                } catch (err) {
                    logger.error('Error processing alert message', err);
                    channel.nack(msg, false, false);
                }
            }
        });
    } catch (error) {
        logger.error('Failed to start alert worker', error);
        process.exit(1);
    }
};

startWorker();
