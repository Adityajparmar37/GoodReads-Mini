# Quick Start Guide - Social Media Queue System

## Setup Steps

### 1. Install Dependencies
Already included in package.json:
- `@aws-sdk/client-sqs` - AWS SQS client
- `mongodb` - Database
- `axios` - HTTP requests

### 2. Configure Environment Variables

Add to your `.env` file:

```env
# AWS SQS Configuration (Required)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_SQS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/123456789/your-queue-name

# Optional: Separate queues for better performance
AWS_SQS_FACEBOOK_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/123456789/facebook-queue
AWS_SQS_INSTAGRAM_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/123456789/instagram-queue
```

### 3. Create AWS SQS Queue

```bash
# Option 1: Using AWS CLI
aws sqs create-queue --queue-name social-media-posts-queue

# Option 2: Using AWS Console
# Go to SQS → Create Queue → Standard Queue → Name: social-media-posts-queue
```

### 4. Deploy Lambda Functions

See `Backend/src/lambda/README.md` for detailed Lambda deployment instructions.

Quick commands:
```bash
cd Backend/src/lambda

# Package and deploy Facebook Lambda
zip -r facebookLambda.zip facebookLambda.js node_modules/
aws lambda create-function --function-name facebook-post-processor ...

# Package and deploy Instagram Lambda
zip -r instagramLambda.zip instagramLambda.js node_modules/
aws lambda create-function --function-name instagram-post-processor ...
```

### 5. Start the Server

```bash
npm run dev
```

The cron job will automatically start and run every 5 minutes.

## Usage

### Queue a Post

```bash
curl -X POST http://localhost:5000/api/v1/queued-posts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "platforms": [1, 2],
    "bookId": "your-book-id"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Post queued successfully",
  "queuedPostId": "generated-uuid"
}
```

### Test Cron Job Manually

```bash
npm run test:cron
```

### Check Post Status

```javascript
// In MongoDB
db.queuedPosts.find({ queuedPostId: "your-post-id" })

// Status values:
// - "pending": Waiting to be processed
// - "processing": Sent to SQS
// - "completed": Successfully posted
// - "failed": Error occurred
```

## Workflow Summary

1. **User makes request** → Post saved with status `pending`
2. **Cron runs (every 5 min)** → Picks pending posts → Sends to SQS → Status: `processing`
3. **Lambda triggered** → Posts to Facebook/Instagram → Updates status to `completed` or `failed`
4. **Success** → Post saved in `posts` collection

## Monitoring

### View Logs

```bash
# Server logs
tail -f logs/server.log

# Lambda logs (AWS CloudWatch)
aws logs tail /aws/lambda/facebook-post-processor --follow
aws logs tail /aws/lambda/instagram-post-processor --follow
```

### Database Queries

```javascript
// Pending posts
db.queuedPosts.find({ status: "pending" }).count()

// Failed posts
db.queuedPosts.find({ status: "failed" })

// Completed today
db.queuedPosts.find({
  status: "completed",
  completedAt: { $gte: new Date(new Date().setHours(0,0,0,0)) }
}).count()
```

## Troubleshooting

### Posts stuck in "pending"
- Check if cron job is running: Look for "Cron job started" in logs
- Verify AWS credentials are correct
- Check SQS queue exists and is accessible

### Posts stuck in "processing"
- Check Lambda function logs in CloudWatch
- Verify Lambda has correct environment variables
- Check Lambda execution role has SQS permissions

### Lambda not triggered
- Verify SQS trigger is configured on Lambda
- Check event source mapping: `aws lambda list-event-source-mappings`
- Ensure Lambda has permission to read from SQS

### Posts failing
- Check error message in `queuedPosts` collection
- Verify Facebook/Instagram credentials are valid
- Check image URL is publicly accessible

## Platform Codes

- `1` = Facebook
- `2` = Instagram

## Important Notes

- Cron interval: 5 minutes (configurable in `src/utils/setupCron.js`)
- Batch size: 10 posts per cron run (configurable in `src/services/cronJob.js`)
- Lambda timeout: 30 seconds (configurable in Lambda settings)
- SQS visibility timeout: 30 seconds (should match Lambda timeout)

## Next Steps

1. Set up CloudWatch alarms for failed posts
2. Implement retry mechanism for failed posts
3. Add scheduling feature for future posts
4. Create admin dashboard for monitoring
