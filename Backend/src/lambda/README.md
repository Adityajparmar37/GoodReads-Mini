# Lambda Functions Setup

This directory contains AWS Lambda functions for processing social media posts from SQS.

## Lambda Functions

### 1. Facebook Lambda (`facebookLambda.js`)
- Processes Facebook posts from SQS
- Posts to Facebook Graph API
- Updates database with post status

### 2. Instagram Lambda (`instagramLambda.js`)
- Processes Instagram posts from SQS
- Posts to Instagram Graph API (2-step process)
- Updates database with post status

## Deployment Steps

### Prerequisites
- AWS Account with Lambda and SQS access
- Node.js 18.x or later runtime

### 1. Create SQS Queue
```bash
# Create a standard SQS queue
aws sqs create-queue --queue-name social-media-posts-queue
```

### 2. Package Lambda Functions

For each Lambda function, create a deployment package:

```bash
# Install dependencies
npm install @aws-sdk/client-sqs mongodb axios

# Create deployment package
zip -r facebookLambda.zip facebookLambda.js node_modules/
zip -r instagramLambda.zip instagramLambda.js node_modules/
```

### 3. Create Lambda Functions

```bash
# Create Facebook Lambda
aws lambda create-function \
  --function-name facebook-post-processor \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR_ACCOUNT:role/lambda-execution-role \
  --handler facebookLambda.handler \
  --zip-file fileb://facebookLambda.zip \
  --timeout 30 \
  --memory-size 256

# Create Instagram Lambda
aws lambda create-function \
  --function-name instagram-post-processor \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR_ACCOUNT:role/lambda-execution-role \
  --handler instagramLambda.handler \
  --zip-file fileb://instagramLambda.zip \
  --timeout 30 \
  --memory-size 256
```

### 4. Set Environment Variables

```bash
# For Facebook Lambda
aws lambda update-function-configuration \
  --function-name facebook-post-processor \
  --environment Variables="{
    MONGO_URL=your_mongo_url,
    DATABASE=your_database_name,
    FACEBOOK_BASE_URL=https://graph.facebook.com/v22.0,
    FACEBOOK_PAGE_ID=your_page_id,
    FACEBOOK_PAGE_ACCESS_TOKEN=your_access_token,
    AWS_SQS_QUEUE_URL=your_queue_url
  }"

# For Instagram Lambda
aws lambda update-function-configuration \
  --function-name instagram-post-processor \
  --environment Variables="{
    MONGO_URL=your_mongo_url,
    DATABASE=your_database_name,
    INSTAGRAM_BASE_URL=https://graph.facebook.com/v22.0,
    INSTAGRAM_ID=your_instagram_id,
    FACEBOOK_PAGE_ACCESS_TOKEN=your_access_token,
    AWS_SQS_QUEUE_URL=your_queue_url
  }"
```

### 5. Configure SQS Triggers

You can either:

**Option A: Use Message Filtering (Recommended)**
- Create two separate SQS queues (one for Facebook, one for Instagram)
- Configure cron job to send to appropriate queue based on platform

**Option B: Use Single Queue with Lambda Filtering**
- Both Lambdas listen to same queue
- Each Lambda filters messages by platform field
- Current implementation uses this approach

```bash
# Add SQS trigger to Facebook Lambda
aws lambda create-event-source-mapping \
  --function-name facebook-post-processor \
  --event-source-arn arn:aws:sqs:REGION:ACCOUNT:social-media-posts-queue \
  --batch-size 10

# Add SQS trigger to Instagram Lambda
aws lambda create-event-source-mapping \
  --function-name instagram-post-processor \
  --event-source-arn arn:aws:sqs:REGION:ACCOUNT:social-media-posts-queue \
  --batch-size 10
```

### 6. IAM Permissions

Ensure Lambda execution role has these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "sqs:ReceiveMessage",
        "sqs:DeleteMessage",
        "sqs:GetQueueAttributes"
      ],
      "Resource": "arn:aws:sqs:REGION:ACCOUNT:social-media-posts-queue"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

## Testing

Test Lambda functions locally or via AWS Console:

```json
{
  "Records": [
    {
      "body": "{\"queuedPostId\":\"test-123\",\"userId\":\"user-456\",\"bookId\":\"book-789\",\"platform\":1,\"postData\":{\"message\":\"Test post\",\"url\":\"https://example.com/image.jpg\"}}",
      "receiptHandle": "test-receipt-handle"
    }
  ]
}
```

## Monitoring

- Check CloudWatch Logs for Lambda execution logs
- Monitor SQS queue metrics (messages in flight, age)
- Check database for post status updates

## Troubleshooting

1. **Lambda timeout**: Increase timeout in Lambda configuration
2. **Memory issues**: Increase memory allocation
3. **SQS messages not processing**: Check IAM permissions and event source mapping
4. **Database connection issues**: Ensure MongoDB connection string is correct and accessible from Lambda
