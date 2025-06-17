import Conversation from "../models/conversation.model.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js"; 

export const startConversation = async (req, res) => {
  const { receiverId } = req.body;
  const senderId = res.locals.user.id;

  try {
    if (!receiverId) {
      return res.status(400).json({ message: "Receiver ID is required" });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, receiverId],
      });
      await conversation.save();
    }

    res
      .status(200)
      .json({
        message: "Conversation started successfully",
        data: conversation,
      });
  } catch (error) {
    console.error("Error in startConversation:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getConversations = async (req, res) => {
  const userId = res.locals.user.id;

  try {
    const conversations = await Conversation.find({ participants: userId })
      .populate("participants", "fullName profilePic _id")
      .sort({ updatedAt: -1 });

    const conversationsWithLastMessage = await Promise.all(
      conversations.map(async (conversation) => {
        const lastMessage = await Message.findOne({ conversationId: conversation._id })
          .sort({ createdAt: -1 })
          .populate("senderId", "fullName profilePic _id")
          .populate("receiverId", "fullName profilePic _id");

        return {
          ...conversation.toObject(),
          lastMessage,
        };
      })
    );

    res.status(200).json({
      message: "Conversations retrieved successfully",
      data: conversationsWithLastMessage,
    });
  } catch (error) {
    console.error("Error in getConversations:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteConversation = async (req, res) => {
  const { conversationId } = req.params;

  try {
    if (!conversationId) {
      return res.status(400).json({ message: "Conversation ID is required" });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    await conversation.deleteOne();

    res
      .status(200)
      .json({
        message: "Conversation deleted successfully",
        data: conversation,
      });
  } catch (error) {
    console.error("Error in deleteConversation:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};