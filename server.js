require("dotenv").config();

const express = require("express");
const app = express();
const ejs = require("ejs");
const expressLayout = require("express-ejs-layouts");
const path = require("path");
const mongoose = require("mongoose");
const routes = require("./routes/web.js");
const session = require("express-session");
const flash = require("express-flash");
const MongoDBStore = require("connect-mongo")(session);
const passport = require("passport");

const PORT = process.env.PORT || 3000;
// const PORT = 3000;

// error
let DB_URL = process.env.MONGO_CONNECTION_URL;

// process.env.MONGO_CONNECTION_URL
// Database Connection
// local db url mongodb://localhost:27017/pizza
// let DB_URL = "mongodb://localhost:27017/pizza";

mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: true,
});

// connecting database
const db = mongoose.connection;

// if connection fails and database is not connected
// we catch error here
db.on("error", console.error.bind(console, "Connection error"));

// else we get connected to database successfully
db.once("open", () => {
  console.log("Database connected");
});

// Session Stored in our database
let mongoStore = new MongoDBStore({
  mongooseConnection: db, // which database to use to save the sessions
  collection: "sessions", // collection in db which saves the session
});

//Event emitter
const Emitter = require("events");
const eventEmitter = new Emitter();
app.set("eventEmitter", eventEmitter);

// Session configuration
app.use(
  session({
    secret: process.env.COOKIE_SECRET, // signature used to sign cookie
    resave: false,
    store: mongoStore,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 24 hr  expiry time
  })
);

// Passport config
const passportInit = require("./app/config/passport");
passportInit(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// Assets
app.use(express.static("public"));

// to decode data obtained in req.body submitted by client through forms
app.use(express.urlencoded({ extended: false }));
// to receive and decode json data sent from client
app.use(express.json());

// Global Middleware
app.use((req, res, next) => {
  // we mount session data from req to res
  res.locals.session = req.session;
  // mount user to res
  res.locals.user = req.user;
  next();
});

// set Template engine
app.use(expressLayout);
app.set("views", path.join(__dirname, "/resources/views"));
app.set("view engine", "ejs");

// Routes
routes(app);

// app listen
const server = app.listen(PORT, () => {
  console.log(`LISTENING ON PORT ${PORT}`);
});

// socket
const io = require("socket.io")(server);
io.on("connection", (socket) => {
  // Join
  socket.on("join", (roomName) => {
    socket.join(roomName);
  });
});

// received event emitted from admin' statusController to user
eventEmitter.on("orderUpdated", (data) => {
  io.to(`order_${data.id}`).emit("orderUpdated", data);
});

// received event emitted from customer's page(new order) to admin's page
eventEmitter.on("orderPlaced", (data) => {
  io.to("adminRoom").emit("orderPlaced", data);
});
