const Message = require("../models/message.model");
const Chat = require("../models/chat.model");

async function createMessage(req, res) {
  try {
    const { sender, content, chat, receiver = "" } = req.body;
    if (!sender && !content)
      return res.status(400).send("send all required details");
    else if (!chat && receiver) {
      const newChat = new Chat({ users: [sender, receiver] });
      const message = new Message({ sender, chat:newChat, content });
      return res.status(200).message("Message sent successfully");
    } else if (!chat && !receiver) {
      return res.status(400).send("send all required details");
    }

    const message = new Message({ sender, content, chat });
    await message.save();
    return res.status(200).message("Message sent successfully");
  } catch (e) {
    console.log("error ", e);
  }
}

async function getMessage(req, res) {
  try {
    const chatId = req.params.chatId;

    if (chatId == "new") return res.status(200).send([]);
    const messages = await Message.find({ chat: chatId })
      .populate({
        path: "sender",
        select: "name id", // Specify the fields you want to retrieve (id and name)
      })
      .sort({ createdAt: 1 });

    res.status(200).send(messages);
  } catch (e) {
    console.log("err ", e);
  }
}

module.exports = { createMessage, getMessage };
