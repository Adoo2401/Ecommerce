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
router.route("/me").get(isAuthenticated, getUserDetails);
router.route("/password_update").put(isAuthenticated,updatePassword);
router.route("/me/update").put(isAuthenticated, updateProfile);
router
  .route("/admin/all/user")
  .get(isAuthenticated, authorizedRoles, getAllUser);
router
  .route("/admin/single/user/:id")
  .get(isAuthenticated, authorizedRoles, getSingleUser);

router
  .route("/admin/modify/:id")
  .put(isAuthenticated, authorizedRoles, updateRole)
  .delete(isAuthenticated, authorizedRoles, deleteUser);
module.exports = router;
