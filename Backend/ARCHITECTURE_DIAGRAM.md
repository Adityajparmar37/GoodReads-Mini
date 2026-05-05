# Social Media Queue System - Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USER REQUEST                                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    POST /api/v1/queued-post/:bookId                     │
│                    (Controller: queuePost)                               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         MongoDB: queuedPosts                             │
│  {                                                                       │
│    queuedPostId: "uuid",                                                │
│    userId: "user-id",                                                   │
│    bookId: "book-id",                                                   │
│    platforms: [1, 2],  // 1=Facebook, 2=Instagram                      │
│    postData: { message, url },                                         │
│    status: "pending"   ← INITIAL STATE                                 │
│  }                                                                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ (Immediate response to user)
                                    ▼
                        ┌───────────────────────┐
                        │  Response: 200 OK     │
                        │  { queuedPostId }     │
                        └───────────────────────┘

═══════════════════════════════════════════════════════════════════════════
                        BACKGROUND PROCESSING
═══════════════════════════════════════════════════════════════════════════

                    ⏰ Every 5 minutes (Cron Job)
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    Cron Job: processPendingPosts()                       │
│  1. Find posts with status="pending" (limit 10)                         │
│  2. Update status to "processing"                                       │
│  3. Send to SQS (one message per platform)                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          AWS SQS Queue                                   │
│  Message Body:                                                           │
│  {                                                                       │
│    queuedPostId: "uuid",                                                │
│    userId: "user-id",                                                   │
│    bookId: "book-id",                                                   │
│    platform: 1,        // Single platform per message                  │
│    postData: { message, url }                                          │
│  }                                                                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
    ┌───────────────────────────┐   ┌───────────────────────────┐
    │   Facebook Lambda         │   │   Instagram Lambda        │
    │   (platform === 1)        │   │   (platform === 2)        │
    └───────────────────────────┘   └───────────────────────────┘
                    │                               │
                    ▼                               ▼
    ┌───────────────────────────┐   ┌───────────────────────────┐
    │  Facebook Graph API       │   │  Instagram Graph API      │
    │  POST /photos             │   │  1. POST /media           │
    │                           │   │  2. POST /media_publish   │
    └───────────────────────────┘   └───────────────────────────┘
                    │                               │
                    └───────────────┬───────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    Update MongoDB Collections                            │
│                                                                          │
│  1. queuedPosts:                                                        │
│     - status: "completed" or "failed"                                   │
│     - platformPostId: "post-id-from-platform"                          │
│     - completedAt: Date or failedAt: Date                              │
│                                                                          │
│  2. posts (if successful):                                              │
│     {                                                                    │
│       sharedId: queuedPostId,                                           │
│       userId, postId, platform, bookId, createdAt                      │
│     }                                                                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                        ┌───────────────────────┐
                        │  Delete SQS Message   │
                        └───────────────────────┘
```

## Data Flow

### 1. Request Phase (Synchronous)
```
User → API → Validate → Save to DB (status: pending) → Return queuedPostId
```

### 2. Processing Phase (Asynchronous)
```
Cron → Find Pending → Update to Processing → Send to SQS
```

### 3. Lambda Phase (Event-Driven)
```
SQS Trigger → Lambda → Post to Social Media → Update DB → Delete SQS Message
```

## Status Transitions

```
pending → processing → completed
                    ↘ failed
```

## Component Responsibilities

### Backend Server
- Accept user requests
- Validate input
- Store posts in database
- Run cron job every 5 minutes
- Send messages to SQS

### AWS SQS
- Queue messages reliably
- Trigger Lambda functions
- Handle retries automatically
- Ensure at-least-once delivery

### Lambda Functions
- Process one platform at a time
- Post to social media APIs
- Update database with results
- Delete processed messages

### MongoDB Collections

#### queuedPosts
- Stores all queued posts
- Tracks status throughout lifecycle
- Contains error messages for failures

#### posts
- Stores successfully posted content
- Used for displaying user's posts
- Links to original queued post

## Error Handling

```
┌─────────────────┐
│  Error Occurs   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Update queuedPosts:            │
│  - status: "failed"             │
│  - error: error.message         │
│  - failedAt: Date               │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Delete SQS Message             │
│  (Prevent infinite retries)     │
└─────────────────────────────────┘
```

## Scalability Features

1. **Horizontal Scaling**: Lambda auto-scales based on queue size
2. **Batch Processing**: Cron processes 10 posts at a time
3. **Platform Separation**: Each platform can have its own queue
4. **Async Processing**: User doesn't wait for social media APIs
5. **Retry Logic**: SQS handles automatic retries

## Monitoring Points

1. **Cron Job Logs**: Check if posts are being picked up
2. **SQS Metrics**: Monitor queue depth and age
3. **Lambda Logs**: Track posting success/failure rates
4. **Database Queries**: Count posts by status
5. **CloudWatch Alarms**: Alert on high failure rates
