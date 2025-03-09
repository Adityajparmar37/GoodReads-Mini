import { handleAsync } from "../middleware/handleAsync.js";
import { messageService } from "../services/message.js";
import { sendResponse } from "../utils/sendResponse.js";
import { io } from "../../app.js";
import { getMessages } from "../query/chat.js";

// @route   POST/api/v1/chat/
// @desc    chat in group
export const chat = handleAsync(async (ctx) => {
  const groupId = ctx.state.group?.groupId;
  const oldMessages = await getMessages(groupId);
  console.log("Old Messages", oldMessages);

  messageService(io, oldMessages);

  sendResponse(ctx, 200, {
    response: {
      success: true,
      message: "socket.io established",
    },
  });
});
