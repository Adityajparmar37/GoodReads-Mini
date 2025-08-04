import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";
import { AWS_CONFIG } from "../../config/index.js";
import { updatePostJobStatus, updatePostWithJobResult } from "../../query/post.js";

const sqsClient = new SQSClient(AWS_CONFIG);

/**
 * Processes messages from SQS queue
 * @param {string} queueUrl - SQS queue URL
 * @param {function} messageHandler - Function to handle each message
 * @param {object} options - Processing options
 * @returns {Promise<object>} Processing result
 */
export const processMessages = async (queueUrl, messageHandler, options = {}) => {
  try {
    const command = new ReceiveMessageCommand({
      QueueUrl: queueUrl,
      MaxNumberOfMessages: options.maxMessages || 10,
      WaitTimeSeconds: options.waitTimeSeconds || 20,
      VisibilityTimeoutSeconds: options.visibilityTimeout || 30,
    });

    const response = await sqsClient.send(command);
    const messages = response.Messages || [];
    
    const results = [];
    
    for (const message of messages) {
      try {
        const messageBody = JSON.parse(message.Body);
        const result = await messageHandler(messageBody);
        
        if (result.success) {
          // Delete message from queue after successful processing
          await deleteMessage(queueUrl, message.ReceiptHandle);
          results.push({ success: true, messageId: message.MessageId });
        } else {
          results.push({ success: false, messageId: message.MessageId, error: result.error });
        }
      } catch (error) {
        console.error('Message processing failed:', error);
        results.push({ success: false, messageId: message.MessageId, error: error.message });
      }
    }
    
    return {
      success: true,
      messagesProcessed: messages.length,
      results,
    };
  } catch (error) {
    console.error('SQS message processing failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Deletes a message from SQS queue
 * @param {string} queueUrl - SQS queue URL
 * @param {string} receiptHandle - Message receipt handle
 * @returns {Promise<object>} Deletion result
 */
export const deleteMessage = async (queueUrl, receiptHandle) => {
  try {
    const command = new DeleteMessageCommand({
      QueueUrl: queueUrl,
      ReceiptHandle: receiptHandle,
    });

    await sqsClient.send(command);
    return { success: true };
  } catch (error) {
    console.error('Message deletion failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Handles job response messages
 * @param {object} message - Response message
 * @returns {Promise<object>} Processing result
 */
export const handleJobResponseMessage = async (message) => {
  try {
    const { jobId, success, result } = message;
    
    if (success) {
      // Update database with successful result
      await updatePostWithJobResult(jobId, result.postId, result.platform);
      console.log(`Job ${jobId} completed successfully`);
    } else {
      // Update database with failure
      await updatePostJobStatus(jobId, 'failed', result.errorMessage);
      console.log(`Job ${jobId} failed: ${result.errorMessage}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Job response handling failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Handles status update messages
 * @param {object} message - Status update message
 * @returns {Promise<object>} Processing result
 */
export const handleStatusUpdateMessage = async (message) => {
  try {
    const { jobId, status, errorMessage } = message;
    
    await updatePostJobStatus(jobId, status, errorMessage);
    console.log(`Job ${jobId} status updated to: ${status}`);
    
    return { success: true };
  } catch (error) {
    console.error('Status update handling failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Starts consuming messages from response queue
 * @param {string} queueUrl - Response queue URL
 * @returns {Promise<void>}
 */
export const startResponseQueueConsumer = async (queueUrl) => {
  console.log('Starting response queue consumer...');
  
  const poll = async () => {
    try {
      await processMessages(queueUrl, handleJobResponseMessage);
    } catch (error) {
      console.error('Response queue polling error:', error);
    }
    
    // Continue polling
    setTimeout(poll, 5000);
  };
  
  poll();
};

/**
 * Starts consuming messages from status update queue
 * @param {string} queueUrl - Status update queue URL
 * @returns {Promise<void>}
 */
export const startStatusUpdateQueueConsumer = async (queueUrl) => {
  console.log('Starting status update queue consumer...');
  
  const poll = async () => {
    try {
      await processMessages(queueUrl, handleStatusUpdateMessage);
    } catch (error) {
      console.error('Status update queue polling error:', error);
    }
    
    // Continue polling
    setTimeout(poll, 5000);
  };
  
  poll();
};