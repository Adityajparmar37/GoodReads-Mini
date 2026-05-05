# Social Media Queue Workflow

## Overview

This system implements an asynchronous workflow for posting content to Facebook and Instagram using a queue-based architecture with AWS SQS and Lambda functions.

## Architecture Flow

```
User Request → Queue Post to DB → Cron Job → SQS → Lambda (FB/IG) → Update DB
```

### Detailed Flow

1. **User Posts Content**
   - User calls `POST /api/v1/queued-posts` endpoint
   - Post is saved to `queuedPosts` collection with status `pending`
   - Returns immediately with queued post ID

2. **Cron Job Processing**
   - Runs every 5 minutes (configurable)
   - Fetches posts with status `pending`
   - Updates status to `processing`
   - Sends each platform post as separate message to SQS

3. **SQS Queue**
   - Receives messages from cron job
   - Triggers appropriate Lambda function based on platform

4. **Lambda Functions**
   - **Facebook Lambda**: Processes platform=1 messages
   - **Instagram Lambda**: Processes platform=2 messages
   - Posts to respective social media platform
   - Updates `queuedPosts` status to `completed` or `failed`
   - Saves successful posts to `posts` collection
   - Deletes message from SQS

## Database Schema

### queuedPosts Collection

```javascript
{
  queuedPostId: String,      // Unique ID
  userId: String,            // User who created the post
  bookId: String,            // Book being shared
  platforms: [Number],       // Array of platforms (1=Facebook, 2=Instagram)
  postData: {
    message: String,         // Post caption/message
    url: String             // Image URL
  },
  status: String,            // pending | processing | completed | failed
  platformPostId: String,    // ID from social media platform (after posting)
  error: String,             // Error message if failed
  createdAt: Date,
  updatedAt: Date,
  completedAt: Date,
  failedAt: Date
}
```

### posts Collection (Existing)

```javascript
{
  sharedId: String,          // Reference to queuedPostId
  userId: String,
  postId: String,            // Platform's post ID
  platform: Number,          // 1=Facebook, 2=Instagram
  bookId: String,
  createdAt: Date
}
```

## API Endpoints

### Queue a Post

```http
POST /api/v1/queued-posts
Authorization: Bearer <token>

Request Body:
{
  "platforms": [1, 2],       // 1=Facebook, 2=Instagram
  "bookId": "book-id-here"
}

Response:
{
  "success": true,
  "message": "Post queued successfully",
  "queuedPostId": "generated-id"
}
```

## Configuration

### Environment Variables

Add to `.env`:

```env
# AWS SQS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_SQS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/account/queue-name
```

### Cron Job Interval

Modify in `src/utils/setupCron.js`:

```javascript
const INTERVAL = 5 * 60 * 1000; // 5 minutes (in milliseconds)
```

## Platform Mapping

- `1` = Facebook
- `2` = Instagram

## Error Handling

### Cron Job Errors
- If post fails to send to SQS, status is set to `failed`
- Error message is stored in database
- Cron continues processing other posts

### Lambda Errors
- If posting to social media fails, status is set to `failed`
- Error message is stored in database
- SQS message is still deleted to prevent reprocessing

## Monitoring

### Check Pending Posts

```javascript
db.queuedPosts.find({ status: "pending" })
```

### Check Failed Posts

```javascript
db.queuedPosts.find({ status: "failed" })
```

### Check Processing Posts

```javascript
db.queuedPosts.find({ status: "processing" })
```

## Advantages of This Architecture

1. **Asynchronous Processing**: User gets immediate response
2. **Scalability**: Lambda auto-scales based on queue size
3. **Reliability**: SQS ensures message delivery
4. **Retry Logic**: Failed posts remain in database for manual retry
5. **Separation of Concerns**: Each component has single responsibility
6. **Cost Effective**: Pay only for Lambda execution time

## Future Enhancements

1. Add retry mechanism for failed posts
2. Implement dead letter queue for persistent failures
3. Add webhook support for post status updates
4. Support scheduling posts for specific times
5. Add analytics and reporting dashboard
6. Implement rate limiting per platform
