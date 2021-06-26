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
    res.status(201).send({ user });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});
//--------------------login----------------
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    if (!user.verified) {
      throw new Error("Please verify email");
    }
    const token = await user.generateAuthToken();
    res.send({ user, token });
    // res.redirect("/profile");
  } catch (e) {
    res.status(400).send({ Error: e.message });
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
    res.status(500).send(e.message);
  }
});

router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send(e.message);
  }
});
//----------------------------beneficiary-----------

router.get("/users/beneficiaryList", auth, async (req, res) => {
  try {
    res.send(req.user.beneficiaries);
  } catch (error) {
    res.status(404).send(error);
  }
});
router.delete("/users/beneficiary/:beneficiary", auth, async (req, res) => {
  // console.log(req);decodeURIComponent('JavaScript_%D1%88%D0%B5%D0%BB%D0%BB%D1%8B')
  const beneficiary = decodeURIComponent(req.params.beneficiary);
  try {
    let removeIndex = req.user.beneficiaries
      .map(function (block) {
        return block.beneficiary;
      })
      .indexOf(beneficiary);
    req.user.beneficiaries.splice(removeIndex, 1);
    await req.user.save();
    res.send(req.user);
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
    res.status(404).send(error.message);
  }
});
router.patch("/users/admin/:userEmail", auth, authorize, async (req, res) => {
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
    res.status(400).send(e.message);
  }
});

// --------------------------get Transactions----------
router.get("/users/transactions", auth, async (req, res) => {
  try {
    const response = await axios.get(
      config.REQUEST_URL + "/wallet/" + req.user.publicKey,
      {
        params: { publicKey: req.user.publicKey },
      }
    );
    const { transactions } = response.data;
    const transactionsList = await Promise.all(
      transactions.map(async (transaction) => {
        // console.log(transaction);
        const outputMap = [];
        for (const property in transaction.outputMap) {
          outputMap.push(property);
        }
        const receiver = await User.findOne({ publicKey: outputMap[0] });
        const sender = await User.findOne({ publicKey: outputMap[1] });
        const date = new Date(transaction.input.timestamp);
        const dateFull =
          date.getDate() +
          "/" +
          (date.getMonth() + 1) +
          "/" +
          date.getFullYear();
        const time =
          date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        return {
          sender: sender.email,
          receiver: receiver.email,
          amount: transaction.input.sendAmount,
          date: dateFull,
          time,
        };
      })
    );

    res.send({ transactionsList: transactionsList });
  } catch (error) {
    res.status(500).send(error);
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
  const allowedUpdates = ["name", "email", "password", "age", "beneficiary"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    updates.forEach((update) =>
      update !== "beneficiary"
        ? (req.user[update] = req.body[update])
        : req.user["beneficiaries"].push({ beneficiary: req.body[update] })
    );
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    res.send(req.user);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

module.exports = router;
