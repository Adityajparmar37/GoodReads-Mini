import { SQSClient, DeleteMessageCommand } from "@aws-sdk/client-sqs";
import { MongoClient } from "mongodb";
import axios from "axios";

const sqs = new SQSClient({ region: process.env.AWS_REGION });
const mongoClient = new MongoClient(process.env.MONGO_URL);

export const handler = async (event) => {
  console.log("Facebook Lambda triggered");

  try {
    await mongoClient.connect();
    const db = mongoClient.db(process.env.DATABASE);

    for (const record of event.Records) {
      const message = JSON.parse(record.body);
      const { queuedPostId, postData, platform } = message;

      if (platform !== 1) {
        console.log("Not a Facebook post, skipping");
        continue;
      }

      try {
        // Post to Facebook
        const response = await axios.post(
          `${process.env.FACEBOOK_BASE_URL}/${process.env.FACEBOOK_PAGE_ID}/photos`,
          {
            message: postData.message,
            url: postData.url,
          },
          {
            params: {
              access_token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
            },
          }
        );

        // Update DB with success
        await db.collection("queuedPosts").updateOne(
          { queuedPostId },
          {
            $set: {
              status: "completed",
              platformPostId: response.data.post_id,
              completedAt: new Date(),
            },
          }
        );

        // Save to posts collection
        await db.collection("posts").insertOne({
          sharedId: queuedPostId,
          userId: message.userId,
          postId: response.data.post_id,
          platform: 1,
          bookId: message.bookId,
          createdAt: new Date(),
        });

        console.log(`Successfully posted to Facebook: ${response.data.post_id}`);
      } catch (error) {
        console.error("Error posting to Facebook:", error);

        // Update DB with failure
        await db.collection("queuedPosts").updateOne(
          { queuedPostId },
          {
            $set: {
              status: "failed",
              error: error.message,
              failedAt: new Date(),
            },
          }
        );
      }

      // Delete message from SQS
      await sqs.send(
        new DeleteMessageCommand({
          QueueUrl: process.env.AWS_SQS_QUEUE_URL,
          ReceiptHandle: record.receiptHandle,
        })
      );
    }

    return { statusCode: 200, body: "Processed successfully" };
  } finally {
    await mongoClient.close();
  }
};
