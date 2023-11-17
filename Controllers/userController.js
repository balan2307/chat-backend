const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const Chat = require("../models/chat.model");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

// var mongoose = require('mongoose');

module.exports.loginUser = async (req, res) => {
  const { email, password } = req.body.data;

  console.log("login ", req.body);

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        title: "user not found",
        error: "invalid credentials",
      });
    }

    console.log("user ", password);

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        title: "login failed",
        error: "invalid credentials",
      });
    }

    let token = jwt.sign({ userId: user._id }, "secretkey", {
      expiresIn: "6d",
    });

    return res.status(200).json({
      title: "login success",
      token,
      data: {
        name: user.name,
        id: user.id,
        token,
      },
    });
  } catch (err) {
    console.log("login error", err);
    return res.status(500).json({
      title: "server error",
      error: err,
    });
  }
};

module.exports.RegisterUser = async (req, res) => {
  const { email, name, password, pic } = req.body.data;

  const newUser = new User({
    email,
    name,
    password,
    pic,
  });

  newUser
    .save()
    .then((info) => {
      let token = jwt.sign({ userId: info._id }, "secretkey", {
        expiresIn: "6d",
      });

      return res.status(200).json({
        title: "signup success",
        data: {
          name: info.name,
          token,
        },
      });
    })
    .catch((err) => {
      if (err.code === 11000 && err.keyPattern.email) {
        return res.status(400).json({
          title: "error",
          error: "An account with this email already exists, try login",
        });
      } else if (err.code === 11000 && err.keyPattern.username) {
        return res.status(400).json({
          title: "error",
          error: "Username already in use, try a different one",
        });
      } else {
        // Handle other errors
        console.log("errpr ", err);
        return res.status(500).json({
          title: "error",
          error: "Internal server error",
        });
      }
    });
};

module.exports.searchUsers = async (req, res) => {
  try {

    let { search: searchString, userId } = req.query;

    const query = {
      $or: [
        { name: { $regex: searchString, $options: "i" } },
        { email: { $regex: searchString, $options: "i" } },
      ],
    };

    const users = await User.find(query).select("_id name");

   
   
    if (userId=="null") {

      return res.status(200).send(users);
      
    }
    const updatedUsers = await Promise.all(
      users.map(async (user) => {
        if (user._id == userId) {
          const chatId = await Chat.find({
            $expr: {
              $setEquals: ["$users", ["$users.0", "$users.1"]],
            },
          });

          return {
            user: user,
            chatId: chatId.length > 0 ? chatId[0]._id : "new",
          };
        }

        const chatId = await Chat.find({ users: { $all: [userId, user._id] } });

        return {
          user: user,
          chatId: chatId.length > 0 ? chatId[0]._id : "new",
        };
      })
    );

    // console.log("Users ",updatedUsers);
    res.status(200).send(updatedUsers);
  } catch (err) {
    console.log("error ", err);
  }
};
