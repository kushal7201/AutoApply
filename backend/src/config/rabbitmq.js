const amqp = require('amqplib');
const logger = require('../utils/logger');

let connection = null;
let channel = null;

const connectRabbitMQ = async () => {
  try {
    if (!process.env.RABBITMQ_URL) {
      logger.warn('⚠️  RabbitMQ URL not provided, skipping RabbitMQ connection');
      return null;
    }

    // Connect to RabbitMQ
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();

    logger.info('✅ RabbitMQ Connected Successfully');

    // Create queues
    const queueName = process.env.RABBITMQ_QUEUE_NAME || 'autoapply_tasks';
    await channel.assertQueue(queueName, {
      durable: true, // Queue survives broker restarts
    });

    // Create dead letter queue for failed jobs
    const dlqName = `${queueName}_dlq`;
    await channel.assertQueue(dlqName, {
      durable: true,
    });

    logger.info(`📋 Queues created: ${queueName}, ${dlqName}`);

    // Handle connection events
    connection.on('error', (err) => {
      logger.error('RabbitMQ connection error:', err);
    });

    connection.on('close', () => {
      logger.warn('RabbitMQ connection closed');
    });

    return { connection, channel };
  } catch (error) {
    logger.error('❌ RabbitMQ connection error:', error);
    // Don't exit process, continue without RabbitMQ
    connection = null;
    channel = null;
    return null;
  }
};

const getChannel = () => {
  return channel;
};

const publishJob = async (jobData, priority = 0) => {
  try {
    if (!channel) {
      logger.error('RabbitMQ channel not available');
      return false;
    }

    const queueName = process.env.RABBITMQ_QUEUE_NAME || 'autoapply_tasks';
    const message = JSON.stringify({
      ...jobData,
      timestamp: new Date().toISOString(),
      id: jobData.id || `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });

    const published = channel.sendToQueue(queueName, Buffer.from(message), {
      persistent: true, // Message survives broker restarts
      priority: priority, // Job priority (0-255)
      timestamp: Date.now(),
    });

    if (published) {
      logger.info(`📤 Job published to queue: ${jobData.type || 'unknown'}`);
      return true;
    } else {
      logger.error('Failed to publish job to queue');
      return false;
    }
  } catch (error) {
    logger.error('Error publishing job:', error);
    return false;
  }
};

const consumeJobs = async (callback) => {
  try {
    if (!channel) {
      logger.error('RabbitMQ channel not available');
      return;
    }

    const queueName = process.env.RABBITMQ_QUEUE_NAME || 'autoapply_tasks';
    
    // Set prefetch count to limit unacknowledged messages
    await channel.prefetch(1);

    await channel.consume(queueName, async (msg) => {
      if (msg !== null) {
        try {
          const jobData = JSON.parse(msg.content.toString());
          logger.info(`📥 Received job: ${jobData.type || 'unknown'}`);
          
          // Execute callback
          await callback(jobData);
          
          // Acknowledge the message
          channel.ack(msg);
          logger.info(`✅ Job completed: ${jobData.id}`);
        } catch (error) {
          logger.error('Error processing job:', error);
          
          // Reject and requeue the message (or send to DLQ)
          channel.nack(msg, false, false);
        }
      }
    });

    logger.info('🎧 Started consuming jobs from queue');
  } catch (error) {
    logger.error('Error setting up job consumer:', error);
  }
};

const closeConnection = async () => {
  try {
    if (channel) {
      await channel.close();
    }
    if (connection) {
      await connection.close();
    }
    logger.info('RabbitMQ connection closed');
  } catch (error) {
    logger.error('Error closing RabbitMQ connection:', error);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  await closeConnection();
});

process.on('SIGTERM', async () => {
  await closeConnection();
});

module.exports = {
  connectRabbitMQ,
  getChannel,
  publishJob,
  consumeJobs,
  closeConnection
};
