const { Conversation, Message } = require("../models/Chat");

const getConversation = async (currentStudentId) => {
  if (currentStudentId) {
    try {
      // العثور على المحادثات المرتبطة بالطالب الحالي
      const currentStudentConversations = await Conversation.find({
        $or: [{ sender: currentStudentId }, { receiver: currentStudentId }],
      })
        .sort({ updatedAt: -1 })
        .populate("sender")
        .populate("receiver")
        .lean(); // تحويل النتائج إلى كائنات بسيطة

      // جلب جميع الرسائل لكل محادثة بشكل منفصل
      const conversationWithMessages = await Promise.all(
        currentStudentConversations.map(async (conv) => {
          const messages = await Message.find({
            _id: { $in: conv.messages },
          }).sort({ createdAt: 1 });

          return { ...conv, messages }; // لا حاجة لاستخدام toObject بسبب lean
        })
      );

      // معالجة المحادثات وإضافة الحقول المطلوبة
      const conversations = conversationWithMessages.map((conv) => {
        const countUnseenMsg = conv.messages.reduce((prev, curr) => {
          const msgByStudentId = curr.msgByStudentId.toString();
          if (msgByStudentId !== currentStudentId) {
            return prev + (curr.seen ? 0 : 1);
          } else {
            return prev;
          }
        }, 0);

        return {
          _id: conv._id,
          sender: conv.sender,
          receiver: conv.receiver,
          unseenMsg: countUnseenMsg,
          lastMsg: conv.messages[conv.messages.length - 1],
        };
      });

      return conversations;
    } catch (error) {
      console.error("Error in getConversation:", error);
      throw error; // ارمي الخطأ ليتم التعامل معه من قبل المستدعي
    }
  } else {
    return [];
  }
};

module.exports = getConversation;
