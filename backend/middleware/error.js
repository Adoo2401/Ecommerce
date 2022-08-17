const ErrorHandler = require("../utils/errorHandler");

module.exports = (err, req, resp, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  resp.status(err.statusCode).json({
    success: false,
    error: err,
  });
};
