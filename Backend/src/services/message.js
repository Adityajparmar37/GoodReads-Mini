import { insertMessage } from "../query/chat.js";
import { createId } from "../utils/createId.js";
import { timestamp } from "../utils/timestamp.js";

export const messageService = (io, oldMessages = []) => {
  try {
    io.on("connection", (socket) => {
      console.log(`User connected: ${socket.id}`);

      //user joined the group
      socket.on("join-group", ({ groupId }) => {
        socket.join(groupId);
        console.log(`User ${socket.id} joined group: ${groupId}`);
        io.to(groupId).emit("old-messages", oldMessages);
      });

      //catch the send-message
      socket.on("send-message", async ({ groupId, message, senderId }) => {
        console.log(`Message from ${senderId} to group ${groupId}:`, message);

        await insertMessage({
          messageId: createId(),
          senderId,
          groupId,
          message: message,
          message_type: "t",
          createdAt: timestamp(),
          updatedAt: timestamp(),
        });

        // send message to group , received by other members
        io.to(groupId).emit("received-message", { message, senderId });
      });

      socket.on("disconnect", () =>
        console.log(`user disconnected : ${socket.id}`)
      );
    });
  } catch (error) {
    //print error in slack
    console.log("Socket error", error);
    ctx.throw(400, "Please try again chatting");
  }
};
