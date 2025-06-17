import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    text: {
      type: String,
    },
    image: {
      type: String,
    },
    repliedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    }
  },
  { timestamps: true }
);

messageSchema.plugin(mongoosePaginate)
const Message = mongoose.model("Message", messageSchema);

export default Message;
