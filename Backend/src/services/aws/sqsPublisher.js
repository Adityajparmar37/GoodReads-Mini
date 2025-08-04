import { SQSClient, SendMessageCommand, SendMessageBatchCommand } from "@aws-sdk/client-sqs";
import { AWS_CONFIG } from "../../config/index.js";

const sqsClient = new SQSClient(AWS_CONFIG);

/**
 * Publishes a message to SQS queue
 * @param {string} queueUrl - SQS queue URL
 * @param {object} message - Message to publish
 * @param {object} options - Additional options
 * @returns {Promise<object>} Publication result
 */
export const publishMessage = async (queueUrl, message, options = {}) => {
  try {
    const command = new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(message),
      DelaySeconds: options.delaySeconds || 0,
      MessageAttributes: options.messageAttributes || {},
    });

    const response = await sqsClient.send(command);
    
    return {
      success: true,
      messageId: response.MessageId,
      md5: response.MD5OfBody,
    };
  } catch (error) {
    console.error('SQS message publication failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Publishes multiple messages to SQS queue in batch
 * @param {string} queueUrl - SQS queue URL
 * @param {array} messages - Array of messages to publish
 * @returns {Promise<object>} Batch publication result
 */
export const publishMessageBatch = async (queueUrl, messages) => {
  try {
    const entries = messages.map((message, index) => ({
      Id: `msg-${index}`,
      MessageBody: JSON.stringify(message),
    }));

    const command = new SendMessageBatchCommand({
      QueueUrl: queueUrl,
      Entries: entries,
    });

    const response = await sqsClient.send(command);
    
    return {
      success: true,
      successful: response.Successful,
      failed: response.Failed,
    };
  } catch (error) {
    console.error('SQS batch message publication failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Publishes job status update message
 * @param {string} queueUrl - Status update queue URL
 * @param {string} jobId - Job ID
 * @param {string} status - Job status
 * @param {object} data - Additional data
 * @returns {Promise<object>} Publication result
 */
export const publishStatusUpdate = async (queueUrl, jobId, status, data = {}) => {
  const message = {
    jobId,
    status,
    timestamp: new Date().toISOString(),
    ...data,
  };
  
  return publishMessage(queueUrl, message);
};

/**
 * Publishes job response message
 * @param {string} queueUrl - Response queue URL
 * @param {string} jobId - Job ID
 * @param {boolean} success - Whether job was successful
 * @param {object} result - Job result data
 * @returns {Promise<object>} Publication result
 */
export const publishJobResponse = async (queueUrl, jobId, success, result = {}) => {
  const message = {
    jobId,
    success,
    timestamp: new Date().toISOString(),
    result,
  };
  
  return publishMessage(queueUrl, message);
};