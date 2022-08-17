const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const cloudinary = require("cloudinary");
const validator = require("validator");

const nodeMailer = require("nodemailer");
//Register a user

exports.registerUser = async (req, resp) => {
  try {
    const check = await User.findOne({ email: req.body.email });
    if (check) {
      return resp.status(500).json({
        success: false,
        code: 345,
        message: "Email Already Exists",
      });
    }

    if (!req.body.name || !req.body.password || !req.body.email) {
      return resp.status(500).json({
        success: false,
        code: 3456,
        message: "Please Enter All Fields",
      });
    }

    if (!validator.isEmail(req.body.email)) {
      return resp.status(500).json({
        success: false,
        code: 890,
        message: "Please Enter a Valid Email",
      });
    }

    if (!validator.isLength(req.body.password, { min: 4, max: 15 })) {
      return resp.status(500).json({
        succes: false,
        code: 2401,
        message: "Password should contain minimum 4 characters and maximun 15",
      });
    }

    if (!req.files) {
      return resp.status(500).json({
        success: false,
        code: 567,
        message: "No image Selected",
      });
    }

    const mycloud = await cloudinary.v2.uploader.upload(
      req.files.avatar.tempFilePath,
      {
        folder: "avatars",
        width: 150,
        crop: "scale",
      }
    );

    const { name, email, password } = req.body;
    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      avatar: {
        public_id: mycloud.public_id,
        url: mycloud.secure_url,
      },
    });

    const token = user.getJWTToken();

    //option for cookies

    const option = {
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    };

    resp.status(201).cookie("token", token, option).json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    resp.status(500).json({
      success: false,
      error: error,
    });
  }
};

//lOGIN USER

exports.loginUser = async (req, resp) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return resp.status(400).json({
      success: false,
      message: "Please provide email and password",
    });
  }

  const user = await User.find({ email }).select("+password");

  if (user.length == 0) {
    return resp.status(500).json({
      success: false,
      code: 134,
      error: "Email And password are incorrect",
    });
  }

  const hashpass = await bcrypt.compare(password, user[0].password);
  const token = jwt.sign({ id: user[0]._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  //option for cookies

  const option = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (hashpass) {
    return resp.status(200).cookie("token", token, option).json({
      success: true,
      user,
      token,
    });
  } else {
    return resp.status(500).json({
      success: false,
      code: 134,
      error: "Email And password are incorrect",
    });
  }
};

//Log out

exports.logoutUser = async (req, resp) => {
  resp
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "Log out successfully",
    });
};

//Reset password -- Generatig password reset token

exports.getResetPasswordToken = async (req, resp) => {
  const { email } = req.body;

  if(!email){
   resp.status(500).json({
    success:false,
    code:5689,
    message:"Please Enter a Email"
   })
  }
  const user = await User.find({ email });

  if (user.length == 0) {
    return resp.status(500).json({
      success: false,
      code:5345,
      message: "Email is incorrect",
    });
  }
  const token = crypto.randomBytes(20).toString("hex");
  const tokenCrypto = crypto.createHash("sha256").update(token).digest("hex");

  await User.updateOne(
    { email },
    {
      resetPasswordToken: tokenCrypto,
      resetPasswordExpire: Date.now() + 15 * 60 * 1000,
    }
  );

  const resetPasswordUrl = `${req.protocol}://${req.get("host")}/reset/password/${token}`;

  const message = `Your Password reset token :-\n\n ${resetPasswordUrl} \n\n if you have not requested this please ignore`;

  try {
    const transporter = nodeMailer.createTransport({
      // host: process.env.SMPT_HOST,
      // PORT: process.env.SMPT_PORT,
      service: 'Zoho',
      auth: {
        user: "abdullahrehamani230@zohomail.com",
        pass: "irR4B9Qe5psz",
      },
    });

    const mailOption = {
      from:"abdullahrehamani230@zohomail.com",
      to: user[0].email,
      subject: "Ecommerce site password recovery",
      text: message,
    };

    await transporter.sendMail(mailOption, (err, info) => {
      if (err) {
       return console.log(err);
      }
    });

    resp.status(200).json({
      success: true,
      code:23,
      message: `Email sent to ${user[0].email} successfully`,
    });
  } catch (error) {
    await User.updateOne(
      { email },
      {
        resetPasswordToken: null,
        resetPasswordExpire: null,
      }
    );
    resp.json({ error });
  }
};

//reset password
exports.resetPassword = async (req, resp, next) => {
  try {
    //Geting token and converting it to hash
    const token = req.params.token;
    const tokenCrypto = crypto.createHash("sha256").update(token).digest("hex");

    //searching for user in database with hashtoken

    if(!req.body.password || !req.body.confirmPassword){
      return resp.status(500).json({
        success:false,
        message:"Please Enter All Fields",
        code:567
      })
    }

    const user = await User.findOne({
      resetPasswordToken: tokenCrypto,
      resetPasswordExpire: { $gt: Date.now() },
    }).clone();

    if (!user) {
      return resp.status(500).json({
        success: false,
        code:890,
        message: "Reset password token is invalid or has been expired",
      });
    }

    if (req.body.password != req.body.confirmPassword) {
      return resp.status(500).json({
        success: false,
        code:432,
        message: "password and confirm password do not matched",
      });
    }

    if(!validator.isLength(req.body.password,{min:4,max:15})){
      return resp.status(500).json({
        success:false,
        code:9289,
        message:"Password should be minimun 4 characters and maximum 15"
      })
    }

    const hash_pass = await bcrypt.hash(req.body.password, 10);
    await User.updateOne(
      { resetPasswordToken: tokenCrypto },
      { password: hash_pass }
    );

    await User.updateOne(
      { resetPasswordToken: tokenCrypto },

      { resetPasswordExpire: null, resetPasswordToken: null }
    );


    return resp.status(200).json({
      success: true,
    });
  } catch (error) {
    resp.status(500).json({
      success: false,
      error,
    });
  }
};

exports.getUserDetails = async (req, resp) => {
  const { token } = req.cookies;
  const decode_token = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decode_token.id).clone();
  resp.status(200).json({
    success: true,
    user,
  });
};

exports.updatePassword = async (req, resp) => {
  try {
    const { token } = req.cookies;
    const decode_token = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decode_token.id).select("+password");

    if(!req.body.newPassword || !req.body.oldPassword || !req.body.confirmPassword){
      return resp.status(500).json({
        success:false,
        code:9034,
        message:"Please Enter all fields"
      })
    }

    if (req.body.newPassword != req.body.confirmPassword) {
      return resp.status(500).json({
        success: false,
        code:456,
        message: "Password do not matched",
      });
    }

    if(!validator.isLength(req.body.newPassword,{min:4,max:15})){
      return resp.status(500).json({
        success:false,
        code:7890,
        message:"Password should contain minimun 4 characters and maximum 15"
      })
    }

    const password_matched = await bcrypt.compare(
      req.body.oldPassword,
      user.password
    );

    if (!password_matched) {
      return resp.status(400).json({
        success: false,
        message: "Old password is incorrect",
        code:56
      });
    }

    const hash_pass = await bcrypt.hash(req.body.newPassword, 10);
    await User.findByIdAndUpdate(decode_token.id, { password: hash_pass });

    const token_cooke = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    resp.status(200).json({
      success: true,
      token_cooke
    });
  } catch (error) {
    resp.status(500).json({
      success: true,
      error,
    });
  }
};

exports.updateProfile = async (req, resp) => {
  try {
    const { token } = req.cookies;

    if (!validator.isEmail(req.body.email)) {
      return resp.status(500).json({
        success: false,
        code: 675,
        message: "Please Enter a valid Email",
      });
    }

    if (!req.body.name || !req.body.email) {
      return resp.status(500).json({
        success: false,
        code: 789,
        message: "Please Enter All Fields",
      });
    }

    const decode_token = jwt.verify(token, process.env.JWT_SECRET);

    let user;

    if (req.files && req.query.public_id != "undefined") {
      const mycloud = await cloudinary.v2.uploader.upload(
        req.files.avatar.tempFilePath,
        {
          folder: "avatars",
          width: 150,
          crop: "scale",
        }
      );

      await cloudinary.uploader.destroy(req.query.public_id);

      user = await User.findByIdAndUpdate(
        decode_token.id,
        {
          name: req.body.name,
          email: req.body.email,
          avatar: {
            public_id: mycloud.public_id,
            url: mycloud.url,
          },
        },
        { new: true }
      );
    } else {
      user = await User.findByIdAndUpdate(
        decode_token.id,
        {
          name: req.body.name,
          email: req.body.email,
        },
        { new: true }
      );
    }

    resp.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    resp.status(500).json({
      success: false,
      error,
    });
  }
};

//Get all users for admin to see how many users are register on website

exports.getAllUser = async (req, resp) => {
  try {
    const user = await User.find().clone();
    resp.status(200).json({
      success:true,
      user,
    });
  } catch (error) {
    resp.status(500).json({
      success: false,
      error,
    });
  }
};

//Get single user detail for admin

exports.getSingleUser = async (req, resp) => {
  try {
    const user = await User.findById(req.params.id).clone();
    if (!user) {
      return resp.status(500).json({
        success: false,
        message: "No user detail found of this id",
      });
    }
    resp.status(200).json({
      success:true,
      user,
    });
  } catch (error) {
    resp.status(500).json({
      success: false,
      error,
    });
  }
};

//admin route to update the role of the user

exports.updateRole = async (req, resp) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
    });

    if (!user) {
      return resp.status(500).json({
        success: false,
        message: "No user found",
      });
    }

    resp.status(200).json({
      success: true,
    });
  } catch (error) {
    resp.status(500).json({
      success: false,
      error,
    });
  }
};

//admin route to delete the user

exports.deleteUser = async (req, resp) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return resp.status(500).json({
        success: false,
        message: "No user found",
      });
    }

   const s=await cloudinary.v2.uploader.destroy(user.avatar.public_id)

    resp.status(200).json({
      success: true,
    });
  } catch (error) {
    resp.status(500).json({
      success: false,
      error,
    });
  }
};
