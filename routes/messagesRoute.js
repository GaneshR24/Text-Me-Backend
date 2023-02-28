const router = require("express").Router();
const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");

// new message

router.post("/new-message", async (req, res) => {
  try {
    const newMessage = new Message(req.body);
    const savedMessage = await newMessage.save();

    await Chat.findOneAndUpdate(
      { _id: req.body.chat },
      { lastMessage: savedMessage._id, $inc: { unreadMessages: 1 } }
    );
    res.send({
      success: true,
      message: "Message sent successfully",
      data: savedMessage,
    });
  } catch (error) {
    res.send({
      success: false,
      message: "Error sending message",
      error: error.message,
    });
  }
});

// Get all messages of a chat

router.get("/get-all-messages/:chatId", async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId }).sort({
      createdAt: 1,
    });
    res.send({
      success: true,
      message: "Messages fetched successfully",
      data: messages,
    });
  } catch (error) {
    res.send({
      success: false,
      message: "Error fetching messages",
      error: error.message,
    });
  }
});

module.exports = router;
