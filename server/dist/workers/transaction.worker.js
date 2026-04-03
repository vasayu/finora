"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Transaction worker is currently disabled (RabbitMQ not configured).
// To re-enable, configure RabbitMQ and restore the queue consumer logic.
const logger_1 = __importDefault(require("../utils/logger"));
logger_1.default.info('⚠️  Transaction worker is disabled — RabbitMQ is not configured');
