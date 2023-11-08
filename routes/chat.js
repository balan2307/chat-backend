const express = require("express");
const router = express.Router();
const {createChat,getChat} =require('../Controllers/chatController')


router.route('/')
.post(createChat)

router.route('/:userId')
.get(getChat)

module.exports=router