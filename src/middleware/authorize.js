const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authorize = async (req, res, next) => {
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
      throw new Error("User not found");
    }
    if (user.userType !== "Admin") {
      throw new Error("User not Authorized");
    }

    req.token = token;
    req.user = user;
    next();
  } catch (e) {
    res.status(401).send({ error: e });
  }
};

module.exports = authorize;
