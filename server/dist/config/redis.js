"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = exports.redis = void 0;
const redis_1 = require("redis");
const env_1 = require("./env");
const logger_1 = __importDefault(require("../utils/logger"));
exports.redis = (0, redis_1.createClient)({
    url: env_1.env.REDIS_URL
});
exports.redis.on('error', (err) => logger_1.default.error('Redis Client Error', err));
exports.redis.on('connect', () => logger_1.default.info('Redis Client Connected'));
const connectRedis = async () => {
    if (!exports.redis.isOpen) {
        await exports.redis.connect();
    }
};
exports.connectRedis = connectRedis;
