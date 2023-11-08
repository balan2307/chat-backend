


const authRouter=require('./auth')
const chatRouter=require('./chat')
const messageRouter=require('./message')
// const auth = require("../middleware/auth");

const InitRoutes = (app) => {


  app.use("/auth", authRouter)
  app.use("/chats",chatRouter)
  app.use("/message",messageRouter)

  console.log("Routes Initialized Successfully")


}


module.exports=InitRoutes;

