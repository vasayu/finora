import amqplib, { Connection, Channel } from 'amqplib';
import { env } from './env';
import logger from '../utils/logger';

let connection: Connection;
let channel: Channel;

export const connectRabbitMQ = async () => {
    try {
        connection = await amqplib.connect(env.RABBITMQ_URL);
        channel = await connection.createChannel();
        logger.info('RabbitMQ connected successfully');

        // Assert necessary queues
        await channel.assertQueue('document_processing', { durable: true });
        await channel.assertQueue('alert_notifications', { durable: true });

    } catch (error) {
        logger.error('Failed to connect to RabbitMQ', error);
        process.exit(1);
    }
};

export const getRabbitChannel = () => {
    if (!channel) {
        throw new Error('RabbitMQ channel not initialized');
    }
    return channel;
};

export const publishToQueue = async (queue: string, data: any) => {
    const ch = getRabbitChannel();
    return ch.sendToQueue(queue, Buffer.from(JSON.stringify(data)), { persistent: true });
};
