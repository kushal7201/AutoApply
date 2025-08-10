import Redis from 'ioredis';
import logger from '../utils/logger.js';

class RedisService {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      const redisUrl = process.env.REDIS_URL;
      
      if (!redisUrl) {
        logger.warn('Redis URL not provided, skipping Redis connection');
        return;
      }

      this.client = new Redis(redisUrl, {
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        maxRetriesPerRequest: null,
        lazyConnect: true,
        connectTimeout: 10000,
        commandTimeout: 5000,
      });

      // Event listeners
      this.client.on('connect', () => {
        logger.info('🔴 Redis connecting...');
      });

      this.client.on('ready', () => {
        this.isConnected = true;
        logger.info('🔴 Redis connected successfully');
      });

      this.client.on('error', (err) => {
        this.isConnected = false;
        logger.error('Redis connection error:', err.message);
      });

      this.client.on('close', () => {
        this.isConnected = false;
        logger.warn('🔴 Redis connection closed');
      });

      this.client.on('reconnecting', () => {
        logger.info('🔴 Redis reconnecting...');
      });

      // Connect to Redis
      await this.client.connect();
      
      // Test the connection
      await this.client.ping();
      logger.info('🔴 Redis ping successful');

    } catch (error) {
      logger.error('Failed to connect to Redis:', error.message);
      this.isConnected = false;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
      logger.info('🔴 Redis disconnected');
    }
  }

  // Cache operations
  async get(key) {
    if (!this.isConnected || !this.client) return null;
    
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis GET error:', error.message);
      return null;
    }
  }

  async set(key, value, ttlSeconds = 3600) {
    if (!this.isConnected || !this.client) return false;
    
    try {
      await this.client.setex(key, ttlSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('Redis SET error:', error.message);
      return false;
    }
  }

  async del(key) {
    if (!this.isConnected || !this.client) return false;
    
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Redis DEL error:', error.message);
      return false;
    }
  }

  async exists(key) {
    if (!this.isConnected || !this.client) return false;
    
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis EXISTS error:', error.message);
      return false;
    }
  }

  // Session operations
  async setSession(sessionId, sessionData, ttlSeconds = 86400) {
    return await this.set(`session:${sessionId}`, sessionData, ttlSeconds);
  }

  async getSession(sessionId) {
    return await this.get(`session:${sessionId}`);
  }

  async deleteSession(sessionId) {
    return await this.del(`session:${sessionId}`);
  }

  // Rate limiting
  async incrementRateLimit(key, windowSeconds = 900) {
    if (!this.isConnected || !this.client) return { count: 0, ttl: 0 };
    
    try {
      const multi = this.client.multi();
      multi.incr(key);
      multi.expire(key, windowSeconds);
      multi.ttl(key);
      
      const results = await multi.exec();
      const count = results[0][1];
      const ttl = results[2][1];
      
      return { count, ttl };
    } catch (error) {
      logger.error('Redis rate limit error:', error.message);
      return { count: 0, ttl: 0 };
    }
  }

  // Health check
  async healthCheck() {
    if (!this.isConnected || !this.client) {
      return { status: 'disconnected', message: 'Redis not connected' };
    }
    
    try {
      const start = Date.now();
      await this.client.ping();
      const responseTime = Date.now() - start;
      
      return {
        status: 'connected',
        responseTime: `${responseTime}ms`,
        connected: this.isConnected
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        connected: false
      };
    }
  }
}

// Create singleton instance
const redisService = new RedisService();

export default redisService;
