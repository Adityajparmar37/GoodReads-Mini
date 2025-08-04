import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import axios from "axios";

const sqsClient = new SQSClient();

/**
 * AWS Lambda handler for Facebook posting
 * @param {object} event - Lambda event containing job data
 * @param {object} context - Lambda context
 * @returns {Promise<object>} Lambda response
 */
export const handler = async (event, context) => {
  console.log('Facebook poster Lambda invoked with event:', JSON.stringify(event));
  
  try {
    const { jobId, postData, responseQueueUrl, accessToken } = event;
    
    if (!jobId || !postData || !responseQueueUrl || !accessToken) {
      throw new Error('Missing required parameters');
    }

    // Post to Facebook
    const postResult = await postToFacebook(postData, accessToken);
    
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
    console.error('Facebook posting failed:', error);
    
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
 * Posts content to Facebook
 * @param {object} postData - Post data containing message and image URL
 * @param {string} accessToken - Facebook access token
 * @returns {Promise<object>} Post result
 */
const postToFacebook = async (postData, accessToken) => {
  try {
    const { message, url: imageUrl } = postData;
    
    // Facebook Graph API endpoint for posting photos
    const baseUrl = 'https://graph.facebook.com/v18.0/me/photos';
    
    const params = {
      access_token: accessToken,
      message,
      url: imageUrl,
    };
    
    const response = await axios.post(baseUrl, params);
    
    if (response.status === 200 && response.data.post_id) {
      return {
        success: true,
        postId: response.data.post_id,
        platform: 1, // Facebook platform ID
      };
    } else {
      throw new Error('Facebook API did not return expected response');
    }
  } catch (error) {
    console.error('Facebook API error:', error);
    return {
      success: false,
      errorMessage: error.response?.data?.error?.message || error.message,
      platform: 1,
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