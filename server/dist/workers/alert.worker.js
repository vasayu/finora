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
        const queue = 'alert_notifications';
        await channel.assertQueue(queue, { durable: true });
        logger_1.default.info(`[*] Waiting for messages in ${queue}.`);
        channel.consume(queue, async (msg) => {
            if (msg !== null) {
                try {
                    const content = JSON.parse(msg.content.toString());
                    logger_1.default.info(`Received alert: ${content.type}`);
                    await database_1.prisma.alert.create({
                        data: {
                            type: content.type,
                            message: content.message,
                            userId: content.userId,
                        }
                    });
                    logger_1.default.info(`Alert saved to DB for user: ${content.userId}`);
                    channel.ack(msg);
                }
                catch (err) {
                    logger_1.default.error('Error processing alert message', err);
                    channel.nack(msg, false, false);
                }
            }
        });
    }
    catch (error) {
        logger_1.default.error('Failed to start alert worker', error);
        process.exit(1);
    }
};
startWorker();
