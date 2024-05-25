const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const getStudentDetailsFromToken = require("../helpers/getStudentDetailsFromToken");
require("dotenv").config();
const Student = require("../models/student.model");
const { Conversation, Message } = require("../models/Chat");
const getConversation = require("../helpers/getConversation");

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    credentials: true,
    origin: process.env.BASE_URL_FRONTEND || "http://localhost:3000",
  },
});

/***
 * socket running at http://localhost:8000/
 */

const onlineUser = new Set();

io.on("connection", async (socket) => {
  console.log("connection User", socket.id);

  const token = socket.handshake.auth.token;

  // current student details
  const student = await getStudentDetailsFromToken(token);

  //create a room
  socket.join(student?._id?.toString());
  onlineUser.add(student?._id?.toString());

  io.emit("onlineUser", Array.from(onlineUser));

  socket.on("message-part", async (studentId) => {
    try {
      const studentDetails = await Student.findById({ _id: studentId }).select(
        "-idNum"
      );
      const payload = {
        _id: studentDetails?._id,
        fullName: studentDetails?.fullName,
        email: studentDetails?.email,
        avatar: studentDetails?.avatar,
        online: onlineUser.has(studentId),
      };

      socket.emit("message-user", payload);

      // الحصول على الرسائل السابقة
      const getConversationMessage = await Conversation.findOne({
        $or: [
          {
            sender: student?._id,
            receiver: studentId,
          },
          {
            sender: studentId,
            receiver: student?._id,
          },
        ],
      });

      if (!getConversationMessage) {
        console.log("No conversation found");
        socket.emit("message", []); // إرسال رسالة فارغة إذا لم توجد محادثة
        return;
      }

      const messagesFind = await Message.find({
        _id: { $in: getConversationMessage.messages },
      }).sort({ createdAt: 1 });

      getConversationMessage.messages = messagesFind;
      console.log("getConversationMessage", getConversationMessage);
      socket.emit("message", getConversationMessage.messages || []);
    } catch (error) {
      console.error("Error in message-part:", error);
      socket.emit("error", "An error occurred while fetching messages");
    }
  });

  //  new message
  socket.on("new message", async (data) => {
    //check conversation is available both user

    let conversation = await Conversation.findOne({
      $or: [
        {
          sender: data?.sender,
          receiver: data?.receiver,
        },
        {
          sender: data?.receiver,
          receiver: data?.sender,
        },
      ],
    });

    // if conversation if not available
    if (!conversation) {
      const createConversation = await Conversation({
        sender: data?.sender,
        receiver: data?.receiver,
      });
      conversation = await createConversation.save();
    }

    const message = new Message({
      text: data?.text,
      imageUrl: data?.imageUrl,
      videoUrl: data?.videoUrl,
      msgByStudentId: data?.msgByStudentId,
    });
    const saveMessage = await message.save();

    const updateConversation = await Conversation.updateOne(
      {
        _id: conversation?._id,
      },
      {
        $push: {
          messages: saveMessage?._id,
        },
      }
    );

    const getConversationMessage = await Conversation.findOne({
      $or: [
        {
          sender: data?.sender,
          receiver: data?.receiver,
        },
        {
          sender: data?.receiver,
          receiver: data?.sender,
        },
      ],
    });

    const messagesFind = await Message.find({
      _id: { $in: getConversationMessage.messages },
    }).sort({ createdAt: 1 });

    getConversationMessage.messages = messagesFind;

    io.to(data?.sender).emit("message", getConversationMessage?.messages || []);
    io.to(data?.receiver).emit(
      "message",
      getConversationMessage?.messages || []
    );

    // send conversation
    const conversationSender = await getConversation(data?.sender);
    const conversationReceiver = await getConversation(data?.receiver);

    io.to(data?.sender).emit("conversation", conversationSender);
    io.to(data?.receiver).emit("conversation", conversationReceiver);
  });

  // sidebar
  socket.on("sidebar", async (currentStudentId) => {
    const conversation = await getConversation(currentStudentId);
    socket.emit("conversation", conversation);
  });

  socket.on("seen", async (msgByStudentId) => {
    const conversation = await Conversation.findOne({
      $or: [
        {
          sender: student?._id,
          receiver: msgByStudentId,
        },
        {
          sender: msgByStudentId,
          receiver: student?._id,
        },
      ],
    });

    const conversationMessagesIds = conversation?.messages || [];

    const updateMessages = await Message.updateMany(
      { _id: { $in: conversationMessagesIds }, msgByStudentId: msgByStudentId },
      { $set: { seen: true } }
    );
    console.log("updateMessages:", updateMessages);
    //send conversation
    const conversationSender = await getConversation(student?._id.toString());
    const conversationReceiver = await getConversation(msgByStudentId);

    io.to(student?._id?.toString()).emit("conversation", conversationSender);
    io.to(msgByStudentId).emit("conversation", conversationReceiver);
  });

  //disconnect
  socket.on("disconnect", () => {
    onlineUser.delete(student?._id?.toString());
    console.log("disconnect User", socket.id);
  });
});

module.exports = {
  app,
  server,
};
