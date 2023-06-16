// to controll website

const express = require("express");
const app = express();
const port = 3000;
const helmet = require("helmet");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
const Contact = require("./models/ContactSchema");
const User = require("./models/UserSchema");
const Posts = require("./models/articleSchema");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const nodemailer = require("nodemailer");

app.use(cookieParser());
app.use(
  session({
    secret: "secret key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

// for auto refresh
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
  .connect(
    "mongodb+srv://ammar:alibrahim@cluster0.51i7rk6.mongodb.net/?retryWrites=true&w=majority"
  )
  .then((result) => {
    app.listen(process.env.PORT || port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });
  })

  .catch((err) => {
    console.log(err);
  });

app.use(helmet());

app.get("/", (req, res) => {
  res.redirect("/home");
});

app.get("/home", (req, res) => {
  Posts.find()
    .then((result) => {
      res.render("home", { arrArticle: result });
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/create-post", (req, res) => {
  res.render("create-post", { mytitle: "create new article" });
});

app.post("/home", (req, res) => {
  const { title, summary, number, shoesname, body } = req.body;

  const contact = new Contact({ title, summary, number, shoesname, body });

  const article = new Posts(req.body);

  // veri nesnesi oluşturma

  // veri nesnesinin veritabanına kaydedilmesi
  article
    .save()
    .then((result) => {
      res.redirect("/home");
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/all-shoes", (req, res) => {
  Contact.find()
    .then((articles) => {
      res.render("all-shoes", { articles });
    })
    .catch((err) => {
      console.error(err);
      res.send("Verileri çekme sırasında hata oluştu.");
    });
});

app.get("/user", (req, res) => {
  if (req.session.user) {
    res.render("user", { user: req.session.user });
  }
});

app.post("/user", (req, res) => {
  const { title, summary, number, shoesname, body } = req.body;

  const contact = new Contact({ title, summary, number, shoesname, body });

  // veri nesnesi oluşturma

  // veri nesnesinin veritabanına kaydedilmesi

  contact
    .save()
    .then(() => {
      res.redirect("/user");
    })
    .catch((err) => {
      console.error(err);
      res.send("Veritabanına kaydetme sırasında hata oluştu.");
    });
});

// Signup Route
app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/signup", (req, res) => {
  const { username, email, password } = req.body;

  User.create({ username, email, password })
    .then((user) => {
      req.session.user = user;

      // Create a transporter using your email provider's SMTP settings
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: "ammaryasir8088@gmail.com",
          pass: "tqpzjkrepkehhqhu",
        },
      });

      // Compose the email message
      const mailOptions = {
        from: "signup-login-project@gmail.com",
        to: user.email, // Use the user's email address here
        subject: "Welcome to Your Website",
        text: "Thank you for signing up.your password is " + user.username,
      };

      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });

      res.redirect("/user");
    })
    .catch((err) => {
      console.error(err);
      res.send("An error occurred while saving the user.");
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
        res.send("Hatalı e-posta veya şifre.");
      }
    })
    .catch((err) => {
      console.error(err);
      res.send("Kullanıcı bulunamadı.");
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
  // form verilerinin alınması
  const { title, summary, number, body } = req.body;

  // veri nesnesi oluşturma
  const contact = new Contact({ title, summary, number, body });

  // veri nesnesinin veritabanına kaydedilmesi
  contact
    .save()
    .then(() => {
      res.redirect("/contactus");
    })
    .catch((err) => {
      console.error(err);
      alert("An error occurred while saving to the database."); // An alert message is added
      res.redirect("/contactus"); // Redirecting to "/contactus" page
    });
});

// 404 Route
app.use((req, res) => {
  res.status(404).render("404");
});

module.exports = app;
