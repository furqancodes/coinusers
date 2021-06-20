const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  // console.log(req.header());
  // console.log(req.headers.Authorization);

  try {
    const token = req.headers.authorization.replace("Bearer ", "");
    // console.log("token", token);

    const decoded = jwt.verify(token, "superSecret");
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    next();
  } catch (e) {
    res.status(401).send({ error: "Please authenticate." });
  }
};

module.exports = auth;
