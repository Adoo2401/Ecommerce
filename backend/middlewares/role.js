
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const authorizedRoles = async (req, resp, next) => {
  const { token } = req.cookies;
  if (!token) {
    return resp.status(401).json({
      success: true,
      message: "Please log in to access this route",
    });
  }
  const decodedData = jwt.verify(token, process.env.JWT_SECRET);

  const user = await userModel.findById(decodedData.id);
  if (user.role != "admin") {
    return resp.status(403).json({
      success: false,
      message: "Only admin can access this route",
    });
  }

  next();
};

module.exports = authorizedRoles;
