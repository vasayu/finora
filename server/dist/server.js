"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const logger_1 = __importDefault(require("./utils/logger"));
const redis_1 = require("./config/redis");
const rabbitmq_1 = require("./config/rabbitmq");
const startServer = async () => {
    try {
        logger_1.default.info('Starting external services connection...');
        // Connect to Redis
        await (0, redis_1.connectRedis)();
        // Connect to RabbitMQ
        await (0, rabbitmq_1.connectRabbitMQ)();
        app_1.default.listen(env_1.env.PORT, () => {
            logger_1.default.info(`Server is running on port ${env_1.env.PORT} in ${env_1.env.NODE_ENV} mode`);
        });
    }
    catch (error) {
        logger_1.default.error('Failed to start server', error);
        process.exit(1);
    }
};
startServer();
