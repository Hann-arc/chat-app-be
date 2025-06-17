import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { uploadToCloudinary } from "../service/media.service.js";

export const getMessagesByConversationId = async (req, res) => {
  const { conversationId } = req.query; 

  try {
    if (!conversationId) {
      return res.status(400).json({ message: "Conversation ID is required" });
    }

    const messages = await Message.find({ conversationId })
      .populate("senderId", "fullName profilePic")
      .populate("repliedTo", "text")
      .sort({ createdAt: 1 })
      .select("-__v");

    res.status(200).json({
      message: "Messages retrieved successfully",
      data: messages,
    });
  } catch (error) {
    console.error("Error in getMessagesByConversationId:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  const senderId = res.locals.user.id;
  const { conversationId, text } = req.body;
  let image;

  try {
    if (req.file) {
      const imageUrI = await uploadToCloudinary(req.file);
      image = imageUrI;
    }

    if (!conversationId || (!text && !image)) {
      return res.status(400).json({
        message: "Conversation ID and either text or image are required",
      });
    }


    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const receiverId = conversation.participants.find(
      participantId => participantId.toString() !== senderId
    );

    if (!receiverId) {
      return res.status(400).json({ message: "Receiver not found in conversation" });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      conversationId,
      text,
      image
    });

    await newMessage.save();

      await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: {
        text: image ? "Image" : text,
        sender: senderId,
        createdAt: new Date()
      }
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("senderId", "fullName profilePic")
      .populate("receiverId", "fullName profilePic");

    res.status(201).json({
      message: "Message sent successfully",
      data: populatedMessage,
    });
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  const { messageId } = req.params;

  try {
    if (!messageId) {
      return res.status(400).json({ message: "Message ID is required" });
    }

    const message = await Message.findById(messageId).select("-__v");

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    await message.deleteOne();

    res
      .status(200)
      .json({ message: "Message deleted successfully", data: message });
  } catch (error) {
    console.error("Error in deleteMessage:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
