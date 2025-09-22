const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");

const sqsClient = new SQSClient({ region: "us-east-1" });

exports.handler = async (event) => {
  try {
    console.log("function started running", event);

    const processesData = { result: "Hello from lambda to World how are you" };

    const params = {
      MessageBody: JSON.stringify(processesData),
      QueueUrl:
        "https://sqs.us-east-1.amazonaws.com/118714796357/lambdaReturnDemoSQS",
    };

    console.log("params", params);
    const result = await sqsClient.send(new SendMessageCommand(params));
    console.log("Message sent to second SQS", result);
    return {
      result,
      statusCode: 200,
      body: JSON.stringify({ success: true, messageId: result.MessageId }),
    };
  } catch (error) {
    console.error("Error sending message to second SQS", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};
