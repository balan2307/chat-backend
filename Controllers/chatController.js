const Chat = require("../models/chat.model");
const User = require("../models/user.model");

async function createChat(req, res) {
  try {
    const { senderId, receiverId } = req.body;

    const chat = new Chat({ users: [senderId, receiverId] });
    await chat.save();
    res.status(200).send("chat created");
  } catch (error) {
    console.log("error ", error);
  }
}

async function createGroupChat(req, res) {
  try {
    const { users, chatName, groupAdmin } = req.body;
    // console.log("group chat ", chatName, users, groupAdmin);

    const updatedUsers = users.map((user) => user.id);

    console.log("updated users ",updatedUsers)

    const newGroupChat = new Chat({
      users: updatedUsers,
      chatName,
      isGroupChat: true,
      groupAdmin: groupAdmin,
    });

    await newGroupChat.save();
    console.log("new chat group ", newGroupChat);
    return res.status(200).send(newGroupChat);
  } catch (err) {}
}

//receiving user id of logged in user
//find chats where the logged in user was part of
//poppulate users field

async function getChat(req, res) {
  try {
    const { userId } = req.params;

    console.log("User ", userId);
    const chats = await Chat.find({ users: { $in: [userId] } })
      .populate({
        path: "users",
        select: "name", // Specify the fields you want to retrieve from the 'users' array
      })
      .select("users _id isGroupChat chatName");

    // console.log("chats ", chats);

    let updateChats = [];

    chats.forEach((chat) => {
      let user = "";
      // console.log("type gc ", typeof chat.isGroupChat);

      if (chat.isGroupChat) {
        user = chat.users;
      } else {
        if (chat.users[0]._id == userId) user = chat.users[1];
        else user = chat.users[0];
      }

      updateChats.push({
        chatId: chat._id,
        user: user,
        latestMessage: chat.latestMessage,
        chatName:chat.chatName,
        isGroupChat:chat.isGroupChat
      });
    });

    res.status(200).send(updateChats);
  } catch (err) {
    console.log("errr ", err);
  }
}

module.exports = { createChat, getChat, createGroupChat };
