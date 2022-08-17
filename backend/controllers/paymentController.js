const stripe=require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.proccessPayment=async(req,resp,next)=>{
 try {

    const myPayment=await stripe.paymentIntents.create({

        amount:req.body.amount,
        currency:"USD",
        metadata:{
            company:"Ecommerce",

        }
    })

    
    resp.status(200).json({
        success:true,
        code:4394,
        client_secret:myPayment.client_secret
    })

   
 } catch (error) {
    resp.status(500).json({
        success:false,
        message:"Something Went Wrong"
    })
 }
}

exports.sendStripeAPIKey=async(req,resp,next)=>{
    try {

        resp.status(200).json({
            stripeAPIKey:process.env.STRIPE_API_KEY
        })
        
    } catch (error) {
        resp.status(500).json({
            success:false,
            message:"Something Went Wrong"
        })
    }
}