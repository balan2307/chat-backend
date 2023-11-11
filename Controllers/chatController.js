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

//receiving user id of logged in user
//find chats where the logged in user was part of
//poppulate users field

async function getChat(req, res) {
  try {
    const { userId } = req.params;
    const chats = await Chat.find({ users: { $in: [userId] } })
      .populate({
        path: "users",
        select: "name", // Specify the fields you want to retrieve from the 'users' array
      })
      .select("users _id");

   

    let updateChats = [];

    chats.forEach((chat) => {

      let user=''
      if (chat.users[0]._id == userId) user=chat.users[1];
      else user=chat.users[0];
      updateChats.push({"chatId":chat._id,user:user})
    });

    res.status(200).send(updateChats);
  } catch (err) {
    console.log("errr ", err);
  }
}

module.exports = { createChat, getChat };
