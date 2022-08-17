const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");




const isAuthenticated = async (req, resp, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return resp.status(401).json({
        success: false,
        message: "Please log in to access this route",
      });
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    
    if(decodedData){
      req.user = await userModel.findById(decodedData.id);

      next();
    }else{
      return resp.status(401).json({
        success:false,
        code:7893,
        message:"Your Session has expired Please Login Agin to continue"
      })
    }
   
  } catch (error) {
    resp.status(500).json({
      success: false,
      error,
    });
  }
};



module.exports = isAuthenticated;

