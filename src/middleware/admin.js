const { error } = require("../utils/responses");

const admin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return error(res, "Admin access required", 403);
  }
  next();
};

module.exports = admin;
