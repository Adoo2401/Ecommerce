const express=require("express");
const { proccessPayment, sendStripeAPIKey } = require("../controllers/paymentController");
const router=express.Router();


const isAuthenticated=require("../middlewares/auth")



router.route("/payment/process").post(proccessPayment)
router.route("/stripeapikey").get(sendStripeAPIKey);





module.exports=router