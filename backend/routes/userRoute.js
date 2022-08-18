const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  getResetPasswordToken,
  resetPassword,
  getUserDetails,
  updatePassword,
  updateProfile,
  getAllUser,
  getSingleUser,
  updateRole,
  deleteUser,
} = require("../controllers/userController");
const router = express.Router();
const authorizedRoles = require("../middlewares/role")
const isAuthenticated=require("../middlewares/auth")



router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);
router.route("/forgot").post(getResetPasswordToken);
router.route("/password/reset/:token").put(resetPassword);
router.route("/me").get(getUserDetails);
router.route("/password_update").put(updatePassword);
router.route("/me/update").put(updateProfile);
router
  .route("/admin/all/user")
  .get(getAllUser);
router
  .route("/admin/single/user/:id")
  .get(getSingleUser);

router
  .route("/admin/modify/:id")
  .put(updateRole)
  .delete( deleteUser);
module.exports = router;
