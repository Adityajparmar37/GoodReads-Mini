import { SQSClient, DeleteMessageCommand } from "@aws-sdk/client-sqs";
import { MongoClient } from "mongodb";
import axios from "axios";

const sqs = new SQSClient({ region: process.env.AWS_REGION });
const mongoClient = new MongoClient(process.env.MONGO_URL);

export const handler = async (event) => {
  console.log("Instagram Lambda triggered");

  try {
    await mongoClient.connect();
    const db = mongoClient.db(process.env.DATABASE);

    for (const record of event.Records) {
      const message = JSON.parse(record.body);
      const { queuedPostId, postData, platform } = message;

      if (platform !== 2) {
        console.log("Not an Instagram post, skipping");
        continue;
      }

      try {
        // Step 1: Create Instagram container
        const createResponse = await axios.post(
          `${process.env.INSTAGRAM_BASE_URL}/${process.env.INSTAGRAM_ID}/media`,
          null,
          {
            params: {
              image_url: postData.url,
              caption: postData.message,
              access_token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
            },
          }
        );

        const creationId = createResponse.data.id;

        // Step 2: Publish the container
        const publishResponse = await axios.post(
          `${process.env.INSTAGRAM_BASE_URL}/${process.env.INSTAGRAM_ID}/media_publish`,
          null,
          {
            params: {
              creation_id: creationId,
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
              platformPostId: publishResponse.data.id,
              completedAt: new Date(),
            },
          }
        );

        // Save to posts collection
        await db.collection("posts").insertOne({
          sharedId: queuedPostId,
          userId: message.userId,
          postId: publishResponse.data.id,
          platform: 2,
          bookId: message.bookId,
          createdAt: new Date(),
        });

        console.log(`Successfully posted to Instagram: ${publishResponse.data.id}`);
      } catch (error) {
        console.error("Error posting to Instagram:", error);

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
