const express = require("express");
const router = express.Router();
const {createMessage,getMessage} =require('../Controllers/messageController')


router.route('/')
.post(createMessage)

router.route("/:chatId")
.get(getMessage)


module.exports=router