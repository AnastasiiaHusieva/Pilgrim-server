// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv").config();
// pusher-event-chat/server/server.js
require("dotenv").config({
  path: "variable.env",
});
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const Pusher = require("pusher");
const mysql = require("mysql");
const sha512 = require("js-sha512").sha512;
var jsdom = require("jsdom");

// ℹ️ Connects to the database
require("./db");
const cors = require("cors");
// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
// const express = require("express");
// diogo;

const app = express();
app.use(
  session({
    secret: "somesecrethere",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(express.static(path.join(__dirname, "/../public")));

app.use(cors());
// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

// 👇 Start handling routes here
const indexRoutes = require("./routes/index.routes");
app.use("/api", indexRoutes);

const authRoutes = require("./routes/auth.routes");
app.use("/auth", authRoutes);

const inboxRoutes = require("./routes/message.routes");
app.use("/inbox", inboxRoutes);

const userRoutes = require("./routes/user.routes");
app.use("/user", userRoutes);

const chatRoutes = require("./routes/chat.routes");
app.use("/chat", chatRoutes);

const postsRoutes = require("./routes/posts.routes");
app.use("/posts", postsRoutes);

const likesRoutes = require("./routes/likes.routes");
app.use("/likes", likesRoutes);

const commentsRoutes = require("./routes/comments.routes");
app.use("/comments", commentsRoutes);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
