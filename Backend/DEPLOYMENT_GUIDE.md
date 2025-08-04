# Deployment Guide for Microservices Architecture

## Overview
This guide covers the deployment of the new microservices architecture for social media posting while maintaining backward compatibility.

## Pre-deployment Checklist

### 1. AWS Setup
- [ ] AWS account with appropriate permissions
- [ ] IAM role for Lambda functions with SQS and CloudWatch permissions
- [ ] SQS queues created (response, status update, dead letter)
- [ ] Lambda functions deployed

### 2. Infrastructure Components

#### SQS Queues
Create the following queues in AWS SQS:
```
1. post-response-queue (for Lambda responses)
2. status-update-queue (for job status updates)
3. post-dlq (dead letter queue)
```

#### Lambda Functions
Deploy the Lambda functions:
```
1. facebook-poster (from /lambda-functions/facebook-poster/)
2. instagram-poster (from /lambda-functions/instagram-poster/)
```

### 3. Environment Configuration
Set the following environment variables:

#### AWS Credentials
```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

#### Lambda ARNs
```bash
FACEBOOK_LAMBDA_ARN=arn:aws:lambda:region:account:function:facebook-poster
INSTAGRAM_LAMBDA_ARN=arn:aws:lambda:region:account:function:instagram-poster
```

#### SQS Queue URLs
```bash
RESPONSE_QUEUE_URL=https://sqs.region.amazonaws.com/account/post-response-queue
STATUS_UPDATE_QUEUE_URL=https://sqs.region.amazonaws.com/account/status-update-queue
DEAD_LETTER_QUEUE_URL=https://sqs.region.amazonaws.com/account/post-dlq
```

#### Feature Flags
```bash
# Enable async posting (default: false)
USE_ASYNC_POSTING=true

# Enable background services (default: false)  
ENABLE_ASYNC_SERVICES=true
```

## Deployment Steps

### 1. Deploy Lambda Functions

#### Facebook Poster Lambda
```bash
cd lambda-functions/facebook-poster
npm install
zip -r facebook-poster.zip .
aws lambda create-function \
  --function-name facebook-poster \
  --runtime nodejs20.x \
  --role arn:aws:iam::ACCOUNT:role/lambda-execution-role \
  --handler index.handler \
  --zip-file fileb://facebook-poster.zip
```

#### Instagram Poster Lambda
```bash
cd lambda-functions/instagram-poster
npm install
zip -r instagram-poster.zip .
aws lambda create-function \
  --function-name instagram-poster \
  --runtime nodejs20.x \
  --role arn:aws:iam::ACCOUNT:role/lambda-execution-role \
  --handler index.handler \
  --zip-file fileb://instagram-poster.zip
```

### 2. Create SQS Queues
```bash
# Response queue
aws sqs create-queue --queue-name post-response-queue

# Status update queue
aws sqs create-queue --queue-name status-update-queue

# Dead letter queue
aws sqs create-queue --queue-name post-dlq
```

### 3. Deploy Backend Application
```bash
# Install dependencies
npm install

# Set environment variables (see above)
export USE_ASYNC_POSTING=true
export ENABLE_ASYNC_SERVICES=true
# ... other variables

# Start application
npm start
```

## Testing the Deployment

### 1. Synchronous Mode (Default)
With `USE_ASYNC_POSTING=false`:
- API responds immediately with results
- Same behavior as before
- No AWS dependencies required

### 2. Asynchronous Mode
With `USE_ASYNC_POSTING=true`:
- API responds with 202 Accepted
- Jobs processed in background
- Results tracked in database

### 3. Test Endpoints
```bash
# Test posting (will use async if enabled)
POST /api/v1/posts/
{
  "platforms": [1, 2],  // Facebook and Instagram
  "book": "book-id"
}

# Check posts (works in both modes)
GET /api/v1/posts/
```

## Monitoring and Troubleshooting

### 1. Application Logs
Monitor console output for:
- Job processing status
- SQS consumer activity
- Lambda invocation results
- Error messages

### 2. AWS CloudWatch
Check Lambda function logs:
- `/aws/lambda/facebook-poster`
- `/aws/lambda/instagram-poster`

### 3. SQS Metrics
Monitor queue metrics:
- Messages sent/received
- Messages in dead letter queue
- Processing times

### 4. Database Queries
Check job status in database:
```javascript
// Find pending jobs
db.posts.find({jobStatus: "pending"})

// Find failed jobs
db.posts.find({jobStatus: "failed"})

// Find completed jobs
db.posts.find({jobStatus: "completed"})
```

## Rollback Plan

### 1. Immediate Rollback
```bash
# Disable async features
export USE_ASYNC_POSTING=false
export ENABLE_ASYNC_SERVICES=false

# Restart application
npm restart
```

### 2. Database Cleanup (if needed)
```javascript
// Remove job-related fields if rolling back completely
db.posts.updateMany({}, {
  $unset: {
    jobId: "",
    jobStatus: "",
    retryCount: "",
    errorMessage: "",
    completedAt: "",
    updatedAt: ""
  }
})
```

## Performance Considerations

### 1. Scaling
- Lambda functions auto-scale based on demand
- SQS handles traffic spikes automatically
- Database may need scaling for high job volumes

### 2. Cost Optimization
- Lambda costs are pay-per-execution
- SQS costs are minimal for most workloads
- Monitor CloudWatch for optimization opportunities

### 3. Error Handling
- Failed jobs retry automatically (up to MAX_RETRY_COUNT)
- Permanent failures go to dead letter queue
- Manual intervention may be needed for dead letter queue items

## Security Considerations

### 1. IAM Permissions
Lambda execution role needs:
- SQS send/receive permissions
- CloudWatch logs permissions
- Network access for social media APIs

### 2. Environment Variables
- Use AWS Systems Manager Parameter Store for sensitive values
- Rotate credentials regularly
- Monitor access logs

### 3. Network Security
- Lambda functions need internet access for social media APIs
- Consider VPC configuration for enhanced security
- Use HTTPS for all external communications

## Maintenance

### 1. Regular Tasks
- Monitor dead letter queue
- Review CloudWatch logs
- Update Lambda function code as needed
- Monitor API rate limits

### 2. Updates
- Deploy Lambda updates using versioning
- Test changes in staging environment first
- Use blue-green deployments for zero downtime

### 3. Backup
- Database backups (existing process)
- Lambda function code versioning
- Configuration backup in version control