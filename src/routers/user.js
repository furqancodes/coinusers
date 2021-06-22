const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

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
    res.status(500).send(e);
  }
});
//----------------------------beneficiary-----------

router.get("/user/beneficiaryList", auth, async (req, res) => {
  try {
    res.send(req.user.beneficiaries);
  } catch (error) {
    res.status(404).send(error);
  }
});
router.delete("/user/:beneficiary", auth, async (req, res) => {
  const beneficiary = req.params.beneficiary;
  try {
    let removeIndex = req.user.beneficiaries
      .map(function (block) {
        return block.beneficiary;
      })
      .indexOf(beneficiary);
    req.user.beneficiaries.splice(removeIndex, 1);

    res.send(req.user.beneficiaries);
  } catch (error) {
    res.status(404).send(error);
  }
});
// -------------------------admin routes------------------

router.get("/users/all", auth, authorize, async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (error) {
    res.status(404).send(error);
  }
});
router.patch("/users/:userEmail", auth, authorize, async (req, res) => {
  const user = await User.findOne({ email: req.params.userEmail });
  const updates = Object.keys(req.body);
  const allowedUpdates = ["verified", "activated"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    updates.forEach((update) => (user[update] = req.body[update]));
    await user.save();
    res.send(user);
  } catch (e) {
    res.status(400).send(e);
  }
});

// -------------------------users routes------------------

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
  const allowedUpdates = [
    "name",
    "email",
    "password",
    "age",
    "verified",
    "activated",
    "beneficiaries",
  ];
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
