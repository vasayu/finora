"use strict";
// RabbitMQ is currently disabled. This file is a placeholder for future RabbitMQ integration.
// When re-enabling, install the `amqplib` package and add RABBITMQ_URL to the env schema.
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishToQueue = exports.getRabbitChannel = exports.connectRabbitMQ = void 0;
const connectRabbitMQ = async () => {
    console.log('⚠️  RabbitMQ is disabled — message queuing is not active');
};
exports.connectRabbitMQ = connectRabbitMQ;
const getRabbitChannel = () => {
    throw new Error('RabbitMQ is not configured');
};
exports.getRabbitChannel = getRabbitChannel;
const publishToQueue = async (queue, data) => {
    console.log(`⚠️  RabbitMQ disabled — message to "${queue}" was not published:`, JSON.stringify(data).slice(0, 100));
};
exports.publishToQueue = publishToQueue;
