import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
  SendMessageCommand,
  SQSClient,
} from "@aws-sdk/client-sqs";

const sqs = new SQSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const QUEUE_URL = process.env.AWS_SQS_QUEUE_URL;
const FACEBOOK_QUEUE_URL = process.env.AWS_SQS_FACEBOOK_QUEUE_URL || QUEUE_URL;
const INSTAGRAM_QUEUE_URL =
  process.env.AWS_SQS_INSTAGRAM_QUEUE_URL || QUEUE_URL;

// send message to SQS queue
export const sendMessage = async (messageBody, platform = null) => {
  console.log("inside sendMessage");

  // Use platform-specific queue if available
  let queueUrl = QUEUE_URL;
  if (platform === 1 && FACEBOOK_QUEUE_URL !== QUEUE_URL) {
    queueUrl = FACEBOOK_QUEUE_URL;
  } else if (platform === 2 && INSTAGRAM_QUEUE_URL !== QUEUE_URL) {
    queueUrl = INSTAGRAM_QUEUE_URL;
  }

  const command = new SendMessageCommand({
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify(messageBody),
  });

  try {
    const data = await sqs.send(command);
    console.log("Message sent to SQS:", data);
    return data;
  } catch (error) {
    console.error("Error sending message to SQS:", error);
    throw error;
  }
};

// poll messages
export const pollMessages = async () => {
  const command = new ReceiveMessageCommand({
    QueueUrl: QUEUE_URL,
    MaxNumberOfMessages: 10,
    WaitTimeSeconds: 10,
  });

  const { Messages } = await sqs.send(command);

  if (Messages) {
    for (const msg of Messages) {
      console.log("Received: ", msg);

      // delete after processing
      await sqs.send(
        new DeleteMessageCommand({
          QueueUrl: QUEUE_URL,
          ReceiptHandle: msg.ReceiptHandle,
        }),
      );
    }
  }
};
