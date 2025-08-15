const redis = require('redis');
const logger = require('../utils/logger');

let redisClient = null;

const connectRedis = async () => {
  try {
    if (!process.env.REDIS_URL) {
      logger.warn('⚠️  Redis URL not provided, skipping Redis connection');
      return null;
    }

    redisClient = redis.createClient({
      url: process.env.REDIS_URL,
      socket: {
        tls: process.env.REDIS_URL.startsWith('rediss://'),
        rejectUnauthorized: false
      }
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('🔗 Redis Client Connected');
    });

    redisClient.on('ready', () => {
      logger.info('📡 Redis Client Ready');
    });

    redisClient.on('end', () => {
      logger.warn('Redis Client Disconnected');
    });

    await redisClient.connect();
    logger.info('✅ Redis Connected Successfully');

    // Test the connection
    await redisClient.set('test', 'connection');
    const testValue = await redisClient.get('test');
    if (testValue === 'connection') {
      logger.info('🧪 Redis Test Successful');
      await redisClient.del('test');
    }

    return redisClient;
  } catch (error) {
    logger.error('❌ Redis connection error:', error);
    // Don't exit process, continue without Redis
    redisClient = null;
    return null;
  }
};

const getRedisClient = () => {
  return redisClient;
};

const disconnectRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    logger.info('Redis connection closed');
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  await disconnectRedis();
});

process.on('SIGTERM', async () => {
  await disconnectRedis();
});

module.exports = {
  connectRedis,
  getRedisClient,
  disconnectRedis
};
