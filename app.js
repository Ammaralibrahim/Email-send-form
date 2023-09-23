const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const helmet = require("helmet");

const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const nodemailer = require("nodemailer");


const path = require("path");
const livereload = require("livereload");
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, "public"));

const connectLivereload = require("connect-livereload");
app.use(connectLivereload());

liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 100);
});

// mongoose
mongoose
  .connect("mongodb+srv://ammar:alibrahim@cluster0.51i7rk6.mongodb.net/your-database-name", {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

app.use(helmet());

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Define your Mongoose models and schemas here.
const Contact = require("./models/ContactSchema");
const User = require("./models/UserSchema");
const Posts = require("./models/articleSchema");

app.use(cookieParser());
app.use(
  session({
    secret: "secret key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

app.get("/", (req, res) => {
  res.redirect("/home");
});

app.get("/home", (req, res) => {
  // Fetch and render articles from your database (Posts model).
  Posts.find()
    .then((result) => {
      res.render("home", { arrArticle: result });
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post("/home", (req, res) => {
  // Handle the creation and saving of new articles.
  const { title, summary, number, shoesname, body } = req.body;
  const article = new Posts({ title, summary, number, shoesname, body });

  article
    .save()
    .then((result) => {
      res.redirect("/home");
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/user", (req, res) => {
  if (req.session.user) {
    res.render("user", { user: req.session.user });
  }
});

app.post("/user", (req, res) => {
  // Handle the creation and saving of user data (Contact model).
  const { title, summary, number, shoesname, body } = req.body;
  const contact = new Contact({ title, summary, number, shoesname, body });

  contact
    .save()
    .then(() => {
      res.redirect("/user");
    })
    .catch((err) => {
      console.error(err);
      res.send("An error occurred while saving to the database.");
    });
});

// Signup Route
app.get("/signup", (req, res) => {
  res.render("signup");
});

// Signup Route
app.post("/signup", (req, res) => {
  // Handle user registration and nodemailer email sending here.
  const { username, email, password } = req.body;

  // Create a transporter
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "ammaryasir8088@gmail.com",
      pass: "afbp vpqe bfsv bpvi",
    },
  });

  // Email content
  const mailOptions = {
    from: "ammaryasir8088@gmail.com",
    to: email,
    subject: "Welcome",
    text: `Hello ${username}, Your registration was successful.`,
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.send("Email sending error");
    } else {
      console.log("Email sent: " + info.response);
      res.send("Registration completed. Email sent.");
    }
  });
});

// Login Route
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email, password })
    .then((user) => {
      if (user) {
        req.session.user = user;
        res.redirect("/user");
      } else {
        res.send("Invalid email or password.");
      }
    })
    .catch((err) => {
      console.error(err);
      res.send("User not found.");
    });
});

// Logout Route
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/home");
});

app.get("/contactus", (req, res) => {
  res.render("contactus");
});

app.post("/contactus", (req, res) => {
  // Handle contact form data and saving to the database.
  const { title, summary, number, body } = req.body;
  const contact = new Contact({ title, summary, number, body });

  contact
    .save()
    .then(() => {
      res.redirect("/contactus");
    })
    .catch((err) => {
      console.error(err);
      res.send("An error occurred while saving to the database.");
    });
});

app.use((req, res) => {
  res.status(404).render("404");
});

module.exports = app;
