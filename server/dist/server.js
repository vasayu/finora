"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("./config/env");
const app_1 = __importDefault(require("./app"));
const logger_1 = __importDefault(require("./utils/logger"));
const startServer = async () => {
    try {
        logger_1.default.info('Starting Finora server...');
        app_1.default.listen(env_1.env.PORT, () => {
            logger_1.default.info(`🚀 Server is running on port ${env_1.env.PORT} in ${env_1.env.NODE_ENV} mode`);
            logger_1.default.info(`📡 API available at http://localhost:${env_1.env.PORT}/api/v1`);
        });
    }
    catch (error) {
        logger_1.default.error('Failed to start server', error);
        process.exit(1);
    }
};
startServer();
