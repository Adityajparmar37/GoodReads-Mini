// AWS Configuration
export const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

// Lambda Function ARNs
export const FACEBOOK_LAMBDA_ARN = process.env.FACEBOOK_LAMBDA_ARN || 'arn:aws:lambda:us-east-1:123456789:function:facebook-poster';
export const INSTAGRAM_LAMBDA_ARN = process.env.INSTAGRAM_LAMBDA_ARN || 'arn:aws:lambda:us-east-1:123456789:function:instagram-poster';

// SQS Queue URLs
export const RESPONSE_QUEUE_URL = process.env.RESPONSE_QUEUE_URL || 'https://sqs.us-east-1.amazonaws.com/123456789/post-response-queue';
export const STATUS_UPDATE_QUEUE_URL = process.env.STATUS_UPDATE_QUEUE_URL || 'https://sqs.us-east-1.amazonaws.com/123456789/status-update-queue';
export const DEAD_LETTER_QUEUE_URL = process.env.DEAD_LETTER_QUEUE_URL || 'https://sqs.us-east-1.amazonaws.com/123456789/post-dlq';

// AWS SDK Configuration
export const AWS_CONFIG = {
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
};

// Job Configuration
export const MAX_RETRY_COUNT = parseInt(process.env.MAX_RETRY_COUNT) || 3;
export const JOB_TIMEOUT_MINUTES = parseInt(process.env.JOB_TIMEOUT_MINUTES) || 5;