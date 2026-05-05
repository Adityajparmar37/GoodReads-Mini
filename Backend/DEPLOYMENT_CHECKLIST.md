# Deployment Checklist - Social Media Queue System

Use this checklist to ensure everything is properly configured before going live.

## Pre-Deployment Checklist

### 1. Environment Variables ✓
- [ ] `MONGO_URL` - MongoDB connection string
- [ ] `DATABASE` - Database name
- [ ] `AWS_REGION` - AWS region (e.g., us-east-1)
- [ ] `AWS_ACCESS_KEY_ID` - AWS access key
- [ ] `AWS_SECRET_ACCESS_KEY` - AWS secret key
- [ ] `AWS_SQS_QUEUE_URL` - SQS queue URL
- [ ] `FACEBOOK_PAGE_ACCESS_TOKEN` - Facebook page token
- [ ] `FACEBOOK_PAGE_ID` - Facebook page ID
- [ ] `FACEBOOK_BASE_URL` - Facebook API base URL
- [ ] `INSTAGRAM_ID` - Instagram business account ID
- [ ] `INSTAGRAM_BASE_URL` - Instagram API base URL

### 2. AWS Setup ✓
- [ ] SQS queue created
- [ ] Lambda functions deployed (Facebook & Instagram)
- [ ] Lambda environment variables configured
- [ ] Lambda execution role has SQS permissions
- [ ] SQS triggers configured on Lambda functions
- [ ] CloudWatch logs enabled for Lambda

### 3. Database Setup ✓
- [ ] MongoDB accessible from server
- [ ] `queuedPosts` collection created (auto-created on first insert)
- [ ] `posts` collection exists
- [ ] Database indexes created (optional but recommended)

### 4. Code Verification ✓
- [ ] All dependencies installed (`npm install`)
- [ ] No syntax errors (`npm run dev` starts successfully)
- [ ] Routes registered in `src/routes/index.js`
- [ ] Cron job initializes on server start

### 5. Testing ✓
- [ ] Run setup test: `npm run test:setup`
- [ ] Test cron job manually: `npm run test:cron`
- [ ] Test API endpoint with valid JWT token
- [ ] Verify post appears in database with status "pending"
- [ ] Wait for cron to run and check status changes to "processing"
- [ ] Verify Lambda processes message and updates status

## Post-Deployment Verification

### Immediate Checks (0-5 minutes)
- [ ] Server starts without errors
- [ ] Cron job initialization message appears in logs
- [ ] API endpoint responds to requests
- [ ] Posts are saved to database

### Short-term Checks (5-15 minutes)
- [ ] Cron job runs and picks up pending posts
- [ ] Messages appear in SQS queue
- [ ] Lambda functions are triggered
- [ ] Posts appear on Facebook/Instagram
- [ ] Database status updates to "completed"

### Long-term Monitoring (Ongoing)
- [ ] Set up CloudWatch alarms for Lambda errors
- [ ] Monitor SQS queue depth
- [ ] Track failed posts in database
- [ ] Review Lambda execution costs
- [ ] Check API response times

## Quick Test Commands

```bash
# 1. Test setup
npm run test:setup

# 2. Start server
npm run dev

# 3. Test API (replace with your values)
curl -X POST http://localhost:5000/api/v1/queued-post/YOUR_BOOK_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"platforms": [1, 2]}'

# 4. Check database
mongo
> use YOUR_DATABASE
> db.queuedPosts.find().pretty()

# 5. Manually trigger cron
npm run test:cron

# 6. Check SQS queue
aws sqs get-queue-attributes \
  --queue-url YOUR_QUEUE_URL \
  --attribute-names ApproximateNumberOfMessages

# 7. Check Lambda logs
aws logs tail /aws/lambda/facebook-post-processor --follow
aws logs tail /aws/lambda/instagram-post-processor --follow
```

## Database Indexes (Recommended)

```javascript
// Connect to MongoDB and run:
db.queuedPosts.createIndex({ status: 1, createdAt: 1 })
db.queuedPosts.createIndex({ queuedPostId: 1 }, { unique: true })
db.queuedPosts.createIndex({ userId: 1 })
```

## Troubleshooting Guide

### Issue: Posts stuck in "pending"
**Check:**
- [ ] Cron job is running (check server logs)
- [ ] AWS credentials are valid
- [ ] SQS queue URL is correct
- [ ] Network connectivity to AWS

**Fix:**
```bash
# Manually trigger cron
npm run test:cron
```

### Issue: Posts stuck in "processing"
**Check:**
- [ ] Lambda functions are deployed
- [ ] Lambda has SQS trigger configured
- [ ] Lambda environment variables are set
- [ ] Lambda execution role has permissions

**Fix:**
```bash
# Check Lambda logs
aws logs tail /aws/lambda/facebook-post-processor --follow
```

### Issue: Lambda errors
**Check:**
- [ ] Lambda timeout is sufficient (30s recommended)
- [ ] Lambda memory is sufficient (256MB recommended)
- [ ] MongoDB connection string is accessible from Lambda
- [ ] Social media API credentials are valid

**Fix:**
- Review CloudWatch logs for specific error
- Test Lambda with sample event in AWS Console

### Issue: Posts failing
**Check:**
- [ ] Facebook/Instagram tokens are valid
- [ ] Image URLs are publicly accessible
- [ ] API rate limits not exceeded
- [ ] Post content meets platform requirements

**Fix:**
```javascript
// Check error in database
db.queuedPosts.find({ status: "failed" })
```

## Rollback Plan

If issues occur in production:

1. **Stop accepting new posts:**
   ```javascript
   // Comment out route in src/routes/index.js
   // queuedPostRoute,
   ```

2. **Stop cron job:**
   ```javascript
   // Comment out in server.js
   // setupCronJob();
   ```

3. **Process existing queue:**
   - Let Lambda finish processing existing messages
   - Or manually update posts to "failed" status

4. **Revert code:**
   ```bash
   git revert HEAD
   npm run dev
   ```

## Success Criteria

✅ System is working correctly when:
- Posts are queued successfully (status: pending)
- Cron picks up posts within 5 minutes
- Lambda processes messages without errors
- Posts appear on social media platforms
- Database status updates to "completed"
- No messages stuck in SQS queue
- Error rate < 5%

## Support Contacts

- AWS Support: [AWS Console](https://console.aws.amazon.com/support)
- Facebook API: [Facebook Developers](https://developers.facebook.com/support)
- Instagram API: [Instagram Platform](https://developers.facebook.com/docs/instagram-api)

## Additional Resources

- [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md)
- [SOCIAL_MEDIA_QUEUE_WORKFLOW.md](SOCIAL_MEDIA_QUEUE_WORKFLOW.md)
- [ARCHITECTURE_DIAGRAM.md](ARCHITECTURE_DIAGRAM.md)
- [src/lambda/README.md](src/lambda/README.md)
