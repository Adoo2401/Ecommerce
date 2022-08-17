const express=require("express");
const { proccessPayment, sendStripeAPIKey } = require("../controllers/paymentController");
const router=express.Router();


const isAuthenticated=require("../middlewares/auth")



router.route("/payment/process").post(isAuthenticated,proccessPayment)
router.route("/stripeapikey").get(isAuthenticated,sendStripeAPIKey);





module.exports=router