const express = require("express");
const env = require("dotenv").config();
const ejs = require("ejs");
const session = require("express-session");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo")(session);

const app = express();

// Connect to MongoDB
mongoose.connect(
  "mongodb+srv://raju:UQBHMgVY9rY0uwUP@filestorage.o1yv2a7.mongodb.net/?retryWrites=true&w=majority&appName=filestorage",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (!err) {
      console.log("MongoDB Connection Succeeded.");
    } else {
      console.log("Error in DB connection : " + err);
    }
  }
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {});

// Session middleware
app.use(
  session({
    secret: "work hard",
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
      mongooseConnection: db,
    }),
  })
);

// Set view engine and views directory
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files from the 'views' directory
app.use(express.static(__dirname + "/views"));

// Routes
const index = require("./routes/index");
app.use("/", index);

// Logout route
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/login"); // Redirect to login page after logout
    }
  });
});

// 404 error handler
app.use(function (req, res, next) {
  var err = new Error("File Not Found");
  err.status = 404;
  next(err);
});

// Error handler
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.send(err.message);
});

const PORT = process.env.PORT || 3500;
app.listen(PORT, function () {
  console.log("Server is started on http://127.0.0.1:" + PORT);
});

// Middleware to check session and redirect to login page if session doesn't exist
const checkSession = (req, res, next) => {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
};

app.use("/protectedRoute", checkSession);
