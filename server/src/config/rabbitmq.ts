// RabbitMQ is currently disabled. This file is a placeholder for future RabbitMQ integration.
// When re-enabling, install the `amqplib` package and add RABBITMQ_URL to the env schema.

export const connectRabbitMQ = async () => {
    console.log('⚠️  RabbitMQ is disabled — message queuing is not active');
};

export const getRabbitChannel = () => {
    throw new Error('RabbitMQ is not configured');
};

export const publishToQueue = async (queue: string, data: any) => {
    console.log(`⚠️  RabbitMQ disabled — message to "${queue}" was not published:`, JSON.stringify(data).slice(0, 100));
};
