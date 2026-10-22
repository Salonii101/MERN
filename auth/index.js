//api codes
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const RegisterModel = require("./models/Register");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const scanRoutes = require("./routes/scan");
const multer = require("multer");
const axios = require("axios");
const chatbotRoutes = require("./routes/chatbot");
// =============================

//============================
require("dotenv").config();
const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(cookieParser());

mongoose.connect("mongodb://127.0.0.1:27017/Safnet");

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  RegisterModel.findOne({ email: email }).then((user) => {
    if (user) {
      //using bcrypt
      bcrypt.compare(password, user.password, (err, response) => {
        if (response) {
          //jwt token
          const token = jwt.sign({ email: user.email }, "jwt-secret-key", {
            expiresIn: "1d",
          });
          res.cookie("token", token);
          res.json("Success");
        } else {
          return res.json("The password is incorrect");
        }
      });
    } else {
      res.json("No record found");
    }
  });
});

app.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  bcrypt
    .hash(password, 10)
    .then((hash) => {
      RegisterModel.create({ name, email, password: hash })
        .then((registers) => res.json(registers))
        .catch((err) => res.json(err));
    })
    .catch((err) => console.log(err.message));
});

const verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json("The token was not available");
  } else {
    jwt.verify(token, "jwt-secret-key", (err, decoded) => {
      if (err) return res.json("Token is wrong");
      next();
    });
  }
};
app.get("/home", verifyUser, (req, res) => {
  return res.json("Success");
});

app.post("/forgot-password", (req, res) => {
  const { email } = req.body;
  RegisterModel.findOne({ email: email }).then((user) => {
    if (!user) {
      return res.send({ Status: "User not existed" });
    }
    const token = jwt.sign({ id: user._id }, "jwt_secret_key", {
      expiresIn: "1d",
    });
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // from .env
        pass: process.env.EMAIL_PASS,
      },
    });

    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: "tanisha.23.bansal@gmail.com",
      subject: "Reset your password",
      text: `http://localhost:5173/reset-password/${user._id}/${token}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        return res.send({ Status: "Success" });
      }
    });
  });
});

app.listen(3001, () => {
  console.log("Server is running");
});

app.post("/reset-password/:id/:token", (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;
  jwt.verify(token, "jwt_secret_key", (err, decoded) => {
    if (err) {
      return res.json({ Status: "Error with token" });
    } else {
      bcrypt
        .hash(password, 10)
        .then((hash) => {
          RegisterModel.findByIdAndUpdate({ _id: id }, { password: hash })
            .then((u) => res.send({ Status: "Success" }))
            .catch((err) => res.send({ Status: err }));
        })
        .catch((err) => res.send({ Status: err }));
    }
  });
});
// Logout
app.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ Status: "Logged out successfully" });
});
//==================================================Malware======
app.use("/api", scanRoutes);

// other existing routes (login/register/forgot)...
// e.g. app.post('/login', ...)

// quick debug to ensure key loaded
console.log(
  "VirusTotal Key:",
  process.env.VIRUSTOTAL_API_KEY ? "✅ Loaded" : "❌ Missing"
);
//=======================
app.use("/api/chatbot", chatbotRoutes);
