"use strict";
// Redis is currently disabled. This file is a placeholder for future Redis integration.
// When re-enabling, install the `redis` package and add REDIS_URL to the env schema.
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = exports.redis = void 0;
exports.redis = null;
const connectRedis = async () => {
    console.log('⚠️  Redis is disabled — caching is not active');
};
exports.connectRedis = connectRedis;
