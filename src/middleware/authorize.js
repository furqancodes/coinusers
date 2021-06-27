const authorize = async (req, res, next) => {
  // console.log(req.header());
  // console.log(req.headers.Authorization);

  try {
    // console.log("authorize middleware");

    if (req.user.userType !== "Admin") {
      console.log(req);
      throw new Error("User not Authorized");
    }

    next();
  } catch (e) {
    res.status(401).send({ error: e.message });
  }
};

module.exports = authorize;
