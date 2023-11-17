const express = require("express");
const router = express.Router();
const {createChat,getChat, createGroupChat} =require('../Controllers/chatController')


router.route('/')
.post(createChat)

router.route('/groupchat')
.post(createGroupChat)

router.route('/:userId')
.get(getChat)

module.exports=router