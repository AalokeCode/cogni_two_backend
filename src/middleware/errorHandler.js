const { error } = require("../utils/responses");

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === "ValidationError") {
    return error(res, "Validation failed", 400, err.errors);
  }

  if (err.name === "JsonWebTokenError") {
    return error(res, "Invalid token", 401);
  }

  if (err.name === "TokenExpiredError") {
    return error(res, "Token expired", 401);
  }

  return error(
    res,
    err.message || "Internal server error",
    err.statusCode || 500
  );
};

module.exports = errorHandler;
