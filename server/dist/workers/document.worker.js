"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const amqplib_1 = __importDefault(require("amqplib"));
const env_1 = require("../config/env");
const database_1 = require("../config/database");
const logger_1 = __importDefault(require("../utils/logger"));
const startWorker = async () => {
    try {
        const connection = await amqplib_1.default.connect(env_1.env.RABBITMQ_URL);
        const channel = await connection.createChannel();
        const queue = 'document_processing';
        await channel.assertQueue(queue, { durable: true });
        logger_1.default.info(`[*] Waiting for messages in ${queue}.`);
        channel.consume(queue, async (msg) => {
            if (msg !== null) {
                try {
                    const content = JSON.parse(msg.content.toString());
                    logger_1.default.info(`Received document for processing: ${content.documentId}`);
                    await database_1.prisma.document.update({
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
                    await database_1.prisma.document.update({
                        where: { id: content.documentId },
                        data: { status: 'COMPLETED', extractedData }
                    });
                    logger_1.default.info(`Completed document processing: ${content.documentId}`);
                    channel.ack(msg);
                }
                catch (err) {
                    logger_1.default.error('Error processing document message', err);
                    // depending on the error, we might nack to requeue
                    channel.nack(msg, false, false);
                }
            }
        });
    }
    catch (error) {
        logger_1.default.error('Failed to start document worker', error);
        process.exit(1);
    }
};
startWorker();
