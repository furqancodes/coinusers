const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");
const config = require("../../config");
const axios = require("axios");
const router = new express.Router();

//-------------------signUp---------------
router.post("/users/signup", async (req, res) => {
  const { name, email, password, age } = req.body;
  // console.log(req.body);
  try {
    const response = await axios.post(config.REQUEST_URL + "/wallet");
    const { publicKey } = response.data;
    let user = new User({ name, email, password, age, publicKey });
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (error) {
    console.log(error);
    res.status(400).send(e);
  }
});
//--------------------login----------------
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
    // res.redirect("/profile");
  } catch (e) {
    res.status(400).send();
  }
});
// -------------------transfer-----------------

router.post("/users/transfer", auth, async (req, res) => {
  const { amount, senderEmail, recipientEmail } = req.body;
  // console.log(req.body);
  try {
    const sender = await User.findOne({
      email: senderEmail,
    });
    const recipient = await User.findOne({
      email: recipientEmail,
    });
    // console.log("sender" + sender.publicKey);
    const response = await axios.post(config.REQUEST_URL + "/transfer", {
      amount,
      recipient: recipient.publicKey,
      senderPublicKey: sender.publicKey,
    });
    console.log(response.data);
    res.send(response.data);
  } catch (error) {
    res.status(404).send(error);
  }
});

// ------------------logout------------------
router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();

    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

router.get("/users/me", auth, async (req, res) => {
  try {
    const response = await axios.get(
      config.REQUEST_URL + "/wallet/" + req.user.publicKey,
      {
        params: { publicKey: req.user.publicKey },
      }
    );
    // console.log(response.data);
    res.send({ user: req.user, wallet: response.data });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "age"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    res.send(req.user);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
