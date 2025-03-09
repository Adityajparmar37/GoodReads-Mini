import { client, DATABASE } from "../config/index.js";
const chatMessages = "chat_mesages";

export const insertMessage = (messageData) =>
  client.db(DATABASE).collection(chatMessages).insertOne(messageData);
export const getMessages = (groupId) =>
  client
    .db(DATABASE)
    .collection(chatMessages)
    .aggregate([
      {
        $match: { groupId },
      },
      {
        $lookup: {
          from: "users",
          foreignField: "userId",
          localField: "senderId",
          as: "sender",
        },
      },
      {
        $unwind: "$sender",
      },
      {
        $project: {
          fullName: { $concat: ["$sender.firstName", " ", "$sender.lastName"] },
          createdAt: 1,
          message: 1,
          message_type: 1,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ])
    .toArray();
