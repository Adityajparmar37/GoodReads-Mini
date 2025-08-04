# Microservices Architecture for Social Media Posting

This implementation provides a microservices architecture for social media posting using AWS Lambda functions and SQS queues, while maintaining backward compatibility with the existing synchronous approach.

## Architecture Overview

```
PostServices → Pick Posts from DB → Invoke Lambda (Facebook/Instagram) 
                                         ↓
Lambda Functions → Process Social Media APIs → Send Result to SQS
                                         ↓
SQS Consumer → Update Database → Complete Processing
```

## Configuration

### Environment Variables

#### Backend Configuration
- `USE_ASYNC_POSTING=true` - Enable async posting (default: false for backward compatibility)
- `ENABLE_ASYNC_SERVICES=true` - Enable SQS consumers and job processor (default: false)

#### AWS Configuration
- `AWS_REGION` - AWS region (default: us-east-1)
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key

#### Lambda Function ARNs
- `FACEBOOK_LAMBDA_ARN` - Facebook poster Lambda function ARN
- `INSTAGRAM_LAMBDA_ARN` - Instagram poster Lambda function ARN

#### SQS Queue URLs
- `RESPONSE_QUEUE_URL` - Queue for Lambda function responses
- `STATUS_UPDATE_QUEUE_URL` - Queue for job status updates
- `DEAD_LETTER_QUEUE_URL` - Dead letter queue for failed messages

#### Job Configuration
- `MAX_RETRY_COUNT` - Maximum retry attempts (default: 3)
- `JOB_TIMEOUT_MINUTES` - Job timeout in minutes (default: 5)

## Components

### 1. PostServices (`src/services/postServices.js`)
- Creates and manages post jobs
- Processes pending jobs
- Handles job retries
- Invokes appropriate Lambda functions

### 2. AWS Services
- **Lambda Invoker** (`src/services/aws/lambdaInvoker.js`) - Invokes Lambda functions
- **SQS Publisher** (`src/services/aws/sqsPublisher.js`) - Publishes messages to SQS
- **SQS Consumer** (`src/services/aws/sqsConsumer.js`) - Consumes messages from SQS

### 3. Lambda Functions
- **Facebook Poster** (`lambda-functions/facebook-poster/index.js`) - Handles Facebook API calls
- **Instagram Poster** (`lambda-functions/instagram-poster/index.js`) - Handles Instagram API calls

### 4. Database Schema
Updated post collection with new fields:
- `jobId` - Unique job identifier
- `jobStatus` - Job status (pending, processing, completed, failed)
- `retryCount` - Number of retry attempts
- `errorMessage` - Error message for failed jobs
- `completedAt` - Job completion timestamp
- `updatedAt` - Last update timestamp

## API Response Changes

### Synchronous Mode (Backward Compatible)
When `USE_ASYNC_POSTING=false` (default):
- Returns 200 on success with immediate results
- Same response format as before

### Asynchronous Mode
When `USE_ASYNC_POSTING=true`:
- Returns 202 Accepted for async processing
- Response includes `jobIds` for tracking
- Jobs are processed in background

Example async response:
```json
{
  "success": true,
  "message": "Posts are being processed asynchronously",
  "jobIds": ["job-123", "job-456"],
  "totalJobs": 2,
  "successfulJobs": 2,
  "failedJobs": 0
}
```

## Deployment

### 1. Deploy Lambda Functions
1. Package each Lambda function with dependencies
2. Deploy to AWS Lambda
3. Configure environment variables and permissions
4. Update ARNs in backend configuration

### 2. Setup SQS Queues
1. Create response queue
2. Create status update queue
3. Create dead letter queue
4. Configure queue permissions for Lambda functions

### 3. Backend Configuration
1. Set environment variables
2. Enable async services: `ENABLE_ASYNC_SERVICES=true`
3. Enable async posting: `USE_ASYNC_POSTING=true`

## Monitoring and Debugging

### Job Status Tracking
Jobs can be tracked using the database:
```javascript
// Find job by ID
const job = await findPostJobById(jobId);

// Find pending jobs
const pendingJobs = await findPendingJobs();

// Find jobs for retry
const retryJobs = await findJobsForRetry(maxRetryCount);
```

### SQS Message Monitoring
- Monitor queue metrics in AWS CloudWatch
- Check dead letter queue for failed messages
- Review Lambda function logs

### Error Handling
- Failed jobs are retried automatically up to `MAX_RETRY_COUNT`
- Permanent failures are logged with error messages
- Dead letter queue captures unprocessable messages

## Backward Compatibility

The implementation maintains full backward compatibility:
- Default behavior remains synchronous
- Existing API endpoints work unchanged
- Same response format when async mode is disabled
- No breaking changes to existing functionality

## Benefits

### Scalability
- Lambda functions auto-scale based on demand
- SQS queues handle traffic spikes
- Database load reduced with async processing

### Reliability
- Built-in retry mechanisms
- Dead letter queues for error handling
- Job status tracking and monitoring

### Performance
- Non-blocking API responses in async mode
- Parallel processing of multiple platforms
- Reduced API response times

### Cost Efficiency
- Pay-per-use Lambda pricing
- No infrastructure maintenance
- Automatic scaling up and down