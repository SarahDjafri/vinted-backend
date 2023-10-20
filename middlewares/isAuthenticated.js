const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = req.headers.authorization.replace("Bearer ", "");

  const user = await User.findOne({ token: token }).select("account _id");
  if (user === null) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  req.user = user;

  next();
};

module.exports = isAuthenticated;
