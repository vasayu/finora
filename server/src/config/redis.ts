// Redis is currently disabled. This file is a placeholder for future Redis integration.
// When re-enabling, install the `redis` package and add REDIS_URL to the env schema.

export const redis = null;
export const connectRedis = async () => {
    console.log('⚠️  Redis is disabled — caching is not active');
};
