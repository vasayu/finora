"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishToQueue = exports.getRabbitChannel = exports.connectRabbitMQ = void 0;
const amqplib_1 = __importDefault(require("amqplib"));
const env_1 = require("./env");
const logger_1 = __importDefault(require("../utils/logger"));
let connection;
let channel;
const connectRabbitMQ = async () => {
    try {
        connection = await amqplib_1.default.connect(env_1.env.RABBITMQ_URL);
        channel = await connection.createChannel();
        logger_1.default.info('RabbitMQ connected successfully');
        // Assert necessary queues
        await channel.assertQueue('document_processing', { durable: true });
        await channel.assertQueue('alert_notifications', { durable: true });
    }
    catch (error) {
        logger_1.default.error('Failed to connect to RabbitMQ', error);
        process.exit(1);
    }
};
exports.connectRabbitMQ = connectRabbitMQ;
const getRabbitChannel = () => {
    if (!channel) {
        throw new Error('RabbitMQ channel not initialized');
    }
    return channel;
};
exports.getRabbitChannel = getRabbitChannel;
const publishToQueue = async (queue, data) => {
    const ch = (0, exports.getRabbitChannel)();
    return ch.sendToQueue(queue, Buffer.from(JSON.stringify(data)), { persistent: true });
};
exports.publishToQueue = publishToQueue;
