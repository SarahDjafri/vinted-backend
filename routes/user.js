const express = require("express");

const router = express.Router();

const User = require("../models/User");
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

router.post("/user/signup", async (req, res) => {
  try {
    const { username, email, password, newsletter } = req.body;
    if (!username) {
      return res.status(400).json({ message: "Missing parameter" });
    }

    const userAlreadyMongo = await User.findOne({ email: email });
    if (userAlreadyMongo) {
      return res.status(409).json({ message: "This email is already used" });
    }
    // console.log(userAlreadyMongo);
    const token = uid2(64);
    const salt = uid2(16);
    const hash = SHA256(salt + password).toString(encBase64);

    const newUser = new User({
      email: email,
      account: {
        username: username,
      },
      newsletter: newsletter,
      token: token, // <= la const juste plus haut
      hash: hash,
      salt: salt,
    });
    // console.log(req.body.username);
    await newUser.save();
    res.status(201).json({
      _id: newUser._id,
      token: newUser.token,
      account: newUser.account,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: req.body.email });

    if (user === null) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // console.log(user);
    const newHash = SHA256(user.salt + req.body.password).toString(encBase64);
    if (newHash !== user.hash) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.json({
      _id: user._id,
      token: user.token,
      account: user.account,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
