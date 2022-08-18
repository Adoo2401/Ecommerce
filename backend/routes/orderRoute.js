const express = require("express");
const router = express.Router();
const {
  createOrder,
  getSingleOrder,
  myOrder,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} = require("../controllers/orderController");


const authorizedRoles = require("../middlewares/role")
const isAuthenticated=require("../middlewares/auth")

router.route("/order/create").post(createOrder);
router.route("/order/:id").get(getSingleOrder);
router.route("/order_user").get(myOrder);
router.route("/allorder").get(getAllOrders);
router
  .route("/updateStatus/:id")
  .put(isAuthenticated, authorizedRoles, updateOrderStatus);
router
  .route("/orderdelete/:id")
  .delete(isAuthenticated, authorizedRoles, deleteOrder);
module.exports = router;
