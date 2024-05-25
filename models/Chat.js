const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    videoUrl: {
      type: String,
      default: "",
    },
    seen: {
      type: Boolean,
      default: false,
    },
    msgByStudentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  },
  {
    timetamps: true,
  }
);

const conversationSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.ObjectId, required: true, ref: "Student" },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
    messages: [],
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", messageSchema);
const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = {
  Message,
  Conversation,
};
