import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import axios from "axios";

const sqsClient = new SQSClient();

/**
 * AWS Lambda handler for Instagram posting
 * @param {object} event - Lambda event containing job data
 * @param {object} context - Lambda context
 * @returns {Promise<object>} Lambda response
 */
export const handler = async (event, context) => {
  console.log('Instagram poster Lambda invoked with event:', JSON.stringify(event));
  
  try {
    const { jobId, postData, responseQueueUrl, accessToken } = event;
    
    if (!jobId || !postData || !responseQueueUrl || !accessToken) {
      throw new Error('Missing required parameters');
    }

    // Post to Instagram (create + publish flow)
    const postResult = await postToInstagram(postData, accessToken);
    
    // Send result back to SQS
    await sendResultToSQS(responseQueueUrl, jobId, postResult);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        jobId,
        result: postResult,
      }),
    };
  } catch (error) {
    console.error('Instagram posting failed:', error);
    
    // Send failure result to SQS
    try {
      const { jobId, responseQueueUrl } = event;
      if (jobId && responseQueueUrl) {
        await sendResultToSQS(responseQueueUrl, jobId, {
          success: false,
          errorMessage: error.message,
        });
      }
    } catch (sqsError) {
      console.error('Failed to send error result to SQS:', sqsError);
    }
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
      }),
    };
  }
};

/**
 * Posts content to Instagram using create + publish flow
 * @param {object} postData - Post data containing message and image URL
 * @param {string} accessToken - Instagram access token
 * @returns {Promise<object>} Post result
 */
const postToInstagram = async (postData, accessToken) => {
  try {
    const { message: caption, url: image_url } = postData;
    
    // Step 1: Create Instagram media container
    const createResponse = await createInstagramMedia(caption, image_url, accessToken);
    
    if (!createResponse.success) {
      return createResponse;
    }
    
    // Step 2: Publish the media container
    const publishResponse = await publishInstagramMedia(createResponse.creationId, accessToken);
    
    return publishResponse;
  } catch (error) {
    console.error('Instagram posting error:', error);
    return {
      success: false,
      errorMessage: error.message,
      platform: 2,
    };
  }
};

/**
 * Creates Instagram media container
 * @param {string} caption - Post caption
 * @param {string} imageUrl - Image URL
 * @param {string} accessToken - Access token
 * @returns {Promise<object>} Creation result
 */
const createInstagramMedia = async (caption, imageUrl, accessToken) => {
  try {
    const baseUrl = 'https://graph.facebook.com/v18.0/me/media';
    
    const params = new URLSearchParams({
      access_token: accessToken,
      caption,
      image_url: imageUrl,
    });
    
    const response = await axios.post(baseUrl, params);
    
    if (response.status === 200 && response.data.id) {
      return {
        success: true,
        creationId: response.data.id,
      };
    } else {
      throw new Error('Instagram create API did not return expected response');
    }
  } catch (error) {
    console.error('Instagram create API error:', error);
    return {
      success: false,
      errorMessage: error.response?.data?.error?.message || error.message,
      platform: 2,
    };
  }
};

/**
 * Publishes Instagram media container
 * @param {string} creationId - Media container ID
 * @param {string} accessToken - Access token
 * @returns {Promise<object>} Publish result
 */
const publishInstagramMedia = async (creationId, accessToken) => {
  try {
    const baseUrl = 'https://graph.facebook.com/v18.0/me/media_publish';
    
    const params = new URLSearchParams({
      access_token: accessToken,
      creation_id: creationId,
    });
    
    const response = await axios.post(baseUrl, params);
    
    if (response.status === 200 && response.data.id) {
      return {
        success: true,
        postId: creationId, // Use creation ID as post ID for tracking
        platform: 2, // Instagram platform ID
      };
    } else {
      throw new Error('Instagram publish API did not return expected response');
    }
  } catch (error) {
    console.error('Instagram publish API error:', error);
    return {
      success: false,
      errorMessage: error.response?.data?.error?.message || error.message,
      platform: 2,
    };
  }
};

/**
 * Sends result to SQS response queue
 * @param {string} queueUrl - SQS queue URL
 * @param {string} jobId - Job ID
 * @param {object} result - Post result
 * @returns {Promise<void>}
 */
const sendResultToSQS = async (queueUrl, jobId, result) => {
  try {
    const message = {
      jobId,
      success: result.success,
      result,
      timestamp: new Date().toISOString(),
    };
    
    const command = new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(message),
    });
    
    await sqsClient.send(command);
    console.log(`Result sent to SQS for job ${jobId}`);
  } catch (error) {
    console.error('SQS send failed:', error);
    throw error;
  }
};