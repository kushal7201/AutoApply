import amqp from 'amqplib';
import logger from '../utils/logger.js';

class RabbitMQService {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      const rabbitUrl = process.env.RABBITMQ_URL;
      
      if (!rabbitUrl) {
        logger.warn('RabbitMQ URL not provided, skipping RabbitMQ connection');
        return;
      }

      // Connect to RabbitMQ
      this.connection = await amqp.connect(rabbitUrl);
      this.channel = await this.connection.createChannel();
      
      // Set up error handling
      this.connection.on('error', (err) => {
        logger.error('RabbitMQ connection error:', err.message);
        this.isConnected = false;
      });

      this.connection.on('close', () => {
        logger.warn('🐰 RabbitMQ connection closed');
        this.isConnected = false;
      });

      this.channel.on('error', (err) => {
        logger.error('RabbitMQ channel error:', err.message);
      });

      this.channel.on('close', () => {
        logger.warn('🐰 RabbitMQ channel closed');
      });

      // Declare default queues
      await this.setupQueues();
      
      this.isConnected = true;
      logger.info('🐰 RabbitMQ connected successfully');
      
    } catch (error) {
      logger.error('Failed to connect to RabbitMQ:', error.message);
      this.isConnected = false;
    }
  }

  async setupQueues() {
    const queues = [
      'autoapply_tasks',
      'job_applications',
      'email_notifications',
      'resume_parsing',
      'rapid_apply'
    ];

    for (const queueName of queues) {
      await this.channel.assertQueue(queueName, {
        durable: true,
        arguments: {
          'x-message-ttl': 24 * 60 * 60 * 1000, // 24 hours TTL
        }
      });
      logger.info(`📋 Queue '${queueName}' declared`);
    }
  }

  async disconnect() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      this.isConnected = false;
      logger.info('🐰 RabbitMQ disconnected');
    } catch (error) {
      logger.error('Error disconnecting from RabbitMQ:', error.message);
    }
  }

  // Publish message to queue
  async publishToQueue(queueName, message, options = {}) {
    if (!this.isConnected || !this.channel) {
      logger.warn(`Cannot publish to queue '${queueName}': Not connected to RabbitMQ`);
      return false;
    }

    try {
      const messageBuffer = Buffer.from(JSON.stringify({
        ...message,
        timestamp: new Date().toISOString(),
        id: this.generateMessageId()
      }));

      const success = this.channel.sendToQueue(queueName, messageBuffer, {
        persistent: true,
        ...options
      });

      if (success) {
        logger.info(`📤 Message published to queue '${queueName}'`);
      } else {
        logger.warn(`📤 Failed to publish message to queue '${queueName}'`);
      }

      return success;
    } catch (error) {
      logger.error(`Error publishing to queue '${queueName}':`, error.message);
      return false;
    }
  }

  // Consume messages from queue
  async consumeFromQueue(queueName, callback, options = {}) {
    if (!this.isConnected || !this.channel) {
      logger.warn(`Cannot consume from queue '${queueName}': Not connected to RabbitMQ`);
      return;
    }

    try {
      await this.channel.consume(queueName, async (msg) => {
        if (msg) {
          try {
            const messageContent = JSON.parse(msg.content.toString());
            logger.info(`📥 Message received from queue '${queueName}'`);
            
            // Execute callback
            await callback(messageContent, msg);
            
            // Acknowledge message
            this.channel.ack(msg);
            
          } catch (error) {
            logger.error(`Error processing message from queue '${queueName}':`, error.message);
            
            // Reject message and requeue
            this.channel.nack(msg, false, true);
          }
        }
      }, {
        noAck: false,
        ...options
      });

      logger.info(`👂 Started consuming from queue '${queueName}'`);
    } catch (error) {
      logger.error(`Error setting up consumer for queue '${queueName}':`, error.message);
    }
  }

  // Job Application Tasks
  async publishJobApplication(jobApplicationData) {
    return await this.publishToQueue('job_applications', {
      type: 'JOB_APPLICATION',
      data: jobApplicationData
    });
  }

  async publishRapidApply(rapidApplyData) {
    return await this.publishToQueue('rapid_apply', {
      type: 'RAPID_APPLY',
      data: rapidApplyData
    });
  }

  async publishEmailNotification(emailData) {
    return await this.publishToQueue('email_notifications', {
      type: 'EMAIL_NOTIFICATION',
      data: emailData
    });
  }

  async publishResumeParsingTask(resumeData) {
    return await this.publishToQueue('resume_parsing', {
      type: 'RESUME_PARSING',
      data: resumeData
    });
  }

  // Utility methods
  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async getQueueInfo(queueName) {
    if (!this.isConnected || !this.channel) {
      return { error: 'Not connected to RabbitMQ' };
    }

    try {
      const queueInfo = await this.channel.checkQueue(queueName);
      return {
        queue: queueName,
        messageCount: queueInfo.messageCount,
        consumerCount: queueInfo.consumerCount
      };
    } catch (error) {
      logger.error(`Error getting queue info for '${queueName}':`, error.message);
      return { error: error.message };
    }
  }

  // Health check
  async healthCheck() {
    if (!this.isConnected) {
      return { status: 'disconnected', message: 'RabbitMQ not connected' };
    }

    try {
      // Check if we can get queue info (simple health check)
      const queueInfo = await this.getQueueInfo('autoapply_tasks');
      
      return {
        status: 'connected',
        connected: this.isConnected,
        queues: queueInfo.error ? 'Error checking queues' : 'Queues accessible'
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
const rabbitMQService = new RabbitMQService();

export default rabbitMQService;
