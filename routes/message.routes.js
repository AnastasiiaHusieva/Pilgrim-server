const express = require("express");
const router = express.Router();
const Message = require("../models/Message.model.js");
const User = require("../models/User.model.js");
const Chat = require("../models/Chat.model");
const Pusher = require("pusher");

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_APP_KEY,
  secret: process.env.PUSHER_APP_SECRET,
  cluster: process.env.PUSHER_APP_CLUSTER,
  forceTLS: true,
});

// router.get("/messages", (req, res, next) => {
//   Message.find()
//     .populate("senderId")
//     .then((messages) => {
//       res.json(messages);
//     })
//     .catch((err) => {
//       console.log("Error fetching data", err);
//       res.status(500).json({ error: "Internal server error" });
//     });
// });

// create new message on already existing chats
router.post("/messages", async (req, res) => {
  try {
    const { senderId, text, isRead, createdAt, chatId } = req.body;

    // Create a new message
    const newMessage = new Message({
      senderId: senderId,
      text: text,
      isRead: isRead || false,
      createdAt: createdAt || Date.now(),
    });

    // Save the message to the database
    const savedMessage = await newMessage.save();

    // Update the sender's and recipient's messagesSent and messagesReceived arrays
    const newChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { messages: savedMessage._id },
      },
      { new: true }
    );

    console.log("C:", newChat);

    // console.log("THIS IS THE CHAT: ", chatId);

    const allMessages = await Chat.findById(chatId).populate("messages");

    const slicedMessages = allMessages.messages.slice(
      allMessages.messages.length - 10
    );
    //allMessages.messages.slice(allMessages.messages.length - 12);

    // let slicedMessages = [];

    // for (let i = allMessages.messages.length - 10; i < allMessages.messages.length - 1; i++) {
    //   slicedMessages.push(allMessages.messages);
    // }

    allMessages.messages = slicedMessages;

    console.log("A: ", allMessages);
    pusher.trigger(`chat`, "message", allMessages);
    res.status(201).json(allMessages);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/messages/:id", async (req, res) => {
  try {
    const chatId = req.params.id;
    const chat = await Chat.findById(chatId).populate("messages");
    res.status(200).json(chat);
  } catch (error) {
    console.log(error);
  }
});

/*

  //localhost:3000/chat/dheoub13oubd1&userId=dawe7dub3uybadu2

------------------------------------------------------------------------------
  ChatPage - Chatting with my gf
  For this page, I only need a chatId and its corresponding Messages
  ------------------------------------------------------------------------------

  router.get(`/chat/:chatId`, (req, res) => {

    const userId = req.query

    // get the chat

    // include a title that is the recipient if you are the sender or is the sender if you are the recipient

    res.send(chat) // sends all the populated messages

  })



------------------------------------------------------------------------------
  ChatListPage - List of all my friends that have a chat with already
  For this page, I need all the chatIds that belong to me, the userId
  ------------------------------------------------------------------------------


    router.get(`users/:userId/chat/`, (req, res) => {


      const userId = req.params

      //get all chats

      const chats = Chat.find({etc}).populate('sender').populate('recipient') //get all the chats where you are the recipient or the sender

      chats.map(chat => {

        if (chat.recipient == userId) chat.title = chat.sender.name
        else if (chat.sender == userId) chat.title = chat.recipient.name
        else res.status(404).send(`The user is neither recipient nor sender`)

      })


      res.send(chats)



    For this page, I need the sender OR the recipient, and put their title on the UI button to open the chat

    - Get All the chats where you are the Recipient
    - Get All the chats where you are the Sender

    (- Join the chats if you haven't already in Mongo)

    - map the chats to have a title (ie. Johannah)
        The title (Raphael) is the recipient if YOU are the sender (I messaged Raphael first)
        The title (Marco) is the sender if YOU are the recipient (Marco messaged me first)


*/

// creating a new message in a new chat
router.post("/newchat", async (req, res) => {
  try {
    console.log("###");
    const { senderId, text, recipientId, isRead } = req.body;
    // Create a new message
    const newMessage = await Message.create({
      senderId: senderId,
      text: text,
      isRead: isRead || false,
    });

    // Save the message to the database
    // const savedMessage = await newMessage.save();
    console.log("%%%%%%%%%%", recipientId);
    const newChat = await Chat.create({
      messages: [newMessage._id],
      senderId: senderId,
      recipientId: recipientId,
    });

    // savedMessage.chatId = newChat._id;
    // await savedMessage.save();
    // await Chat.findByIdAndUpdate(
    //   senderId,
    //   {
    //     $push: { message: savedMessage._id },
    //   },
    //   { new: true }
    // );
    res.status(201).json(newChat);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.patch("/messages/isRead/:chatId", async (req, res, next) => {
  const chatId = req.params.chatId;
  console.log("Received user chatId:", chatId);
  try {
    const chat = await Chat.findById(chatId).populate("messages");
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }
    // Get the message IDs from the populated messages
    const messageIds = chat.messages.map((message) => message._id);

    await Message.updateMany(
      { _id: { $in: messageIds } },
      { $set: { isRead: true } }
    );
    res.status(200).json({ message: "Messages marked as read" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = router;
