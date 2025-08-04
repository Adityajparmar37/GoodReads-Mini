import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { AWS_CONFIG, FACEBOOK_LAMBDA_ARN, INSTAGRAM_LAMBDA_ARN } from "../../config/index.js";

const lambdaClient = new LambdaClient(AWS_CONFIG);

/**
 * Invokes Lambda function for social media posting
 * @param {string} platform - Platform type ('facebook' or 'instagram')
 * @param {object} payload - Job payload containing post data
 * @returns {Promise<object>} Lambda invocation result
 */
export const invokeLambdaFunction = async (platform, payload) => {
  try {
    const functionArn = platform === 'facebook' ? FACEBOOK_LAMBDA_ARN : INSTAGRAM_LAMBDA_ARN;
    
    const command = new InvokeCommand({
      FunctionName: functionArn,
      InvocationType: 'Event', // Async invocation
      Payload: JSON.stringify(payload),
    });

    const response = await lambdaClient.send(command);
    
    return {
      success: true,
      statusCode: response.StatusCode,
      payload: response.Payload,
    };
  } catch (error) {
    console.error(`Lambda invocation failed for ${platform}:`, error);
    return {
      success: false,
      error: error.message,
      platform,
    };
  }
};

/**
 * Invokes Facebook Lambda function
 * @param {object} jobData - Job data containing post information
 * @returns {Promise<object>} Invocation result
 */
export const invokeFacebookLambda = async (jobData) => {
  return invokeLambdaFunction('facebook', {
    jobId: jobData.jobId,
    postData: jobData.postData,
    responseQueueUrl: jobData.responseQueueUrl,
    accessToken: jobData.accessToken,
  });
};

/**
 * Invokes Instagram Lambda function
 * @param {object} jobData - Job data containing post information
 * @returns {Promise<object>} Invocation result
 */
export const invokeInstagramLambda = async (jobData) => {
  return invokeLambdaFunction('instagram', {
    jobId: jobData.jobId,
    postData: jobData.postData,
    responseQueueUrl: jobData.responseQueueUrl,
    accessToken: jobData.accessToken,
  });
};