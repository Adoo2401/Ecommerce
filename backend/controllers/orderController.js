const Order = require("../models/orderModel");
const jwt = require("jsonwebtoken");
const Product = require("../models/productModel");
//Create new order

exports.createOrder = async (req, resp) => {
  const { token } = req.cookies;

  const decode_token = jwt.verify(token, process.env.JWT_SECRET);
  const cart = req.body.orderItem.cart;

  let data = {};

  let final = [];

  cart.map((elm, ind) => {

    data = {
      productName: elm.productName,
      productPrice: elm.productPrice,
      productQuantity: elm.productQuantity,
      productImages: elm.productImages[0].url,
      productId: elm.productId,
    };

    final.push(data);
  });

  

  const order = await Order.create({
    shippingInfo: {
      address: req.body.shippingInfo.address,
      state: req.body.shippingInfo.state,
      city: req.body.shippingInfo.city,
      country: req.body.shippingInfo.country,
      pinCode: req.body.shippingInfo.pinCode,
      phoneNo: req.body.shippingInfo.phoneNo,
    },


    orderItem:final,
      
   

    user: decode_token.id,

    paymentInfo: {
      id: req.body.paymentInfo.id,
      status: req.body.paymentInfo.status,
      paidAt: Date.now(),
      itemsPrice: req.body.paymentInfo.itemsPrice,
      taxPrice: req.body.paymentInfo.taxPrice,
      shippingPrice: req.body.paymentInfo.shippingPrice,
      totalPrice: req.body.paymentInfo.totalPrice,
    },
  });

  resp.status(200).json({
    success: true,
    order,
  });
};

//Get single order

exports.getSingleOrder = async (req, resp) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .clone();

    if (!order) {
      return resp.status(500).json({
        success: false,
        message: "No order found",
      });
    }

    resp.status(200).json({
      success: true,
      message: order,
    });
  } catch (error) {
    resp.status(500).json({
      success: false,
      message: error,
    });
  }
};

//Get logged in user Orders

exports.myOrder = async (req, resp) => {
  try {
    const { token } = req.cookies;

    const decode_token = jwt.verify(token, process.env.JWT_SECRET);

    const order = await Order.find({ user: decode_token.id }).clone();

    if (order.length == 0) {
      return resp.status(500).json({
        success: false,
        message: "No order found",
      });
    }

    resp.status(200).json({
      success: true,
      message: order,
    });
  } catch (error) {
    resp.status(500).json({
      success: false,
      message: error,
    });
  }
};

//Get all orders -- admin

exports.getAllOrders = async (req, resp) => {
  try {
    const order = await Order.find().clone();

    if (order.length == 0) {
      return resp.status(500).json({
        success: false,
        message: "NO order found",
      });
    }
    let totalAmount = 0;

    order.forEach((elm) => {
      totalAmount += elm.paymentInfo.totalAmount;
    });

    resp.status(200).json({
      success: true,
      order,
      totalAmount,
    });
  } catch (error) {
    resp.status(500).json({
      success: true,
      message: error,
    });
  }
};

//Update Order Status --admin

exports.updateOrderStatus = async (req, resp) => {

  const order = await Order.findById(req.params.id).clone();

  if (!order) {
    return resp.status(500).json({
      success: false,
      message: "NO order found",
    });
  }
  if (order.orderStatus == "Delivered") {
    return resp.status(404).json({
      success: false,
      message: "Order is already delivered",
    });
  }

 if(req.body.status==='Shipped'){
  order.orderItem.forEach(async (elm) => {
    await updateStock(elm.productId, elm.productQuantity);
  });
 }

  order.orderStatus = req.body.status;

  if (req.body.status == "Delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });

  resp.status(200).json({
    success: true,
  });
};

async function updateStock(id, quantity) {

  const product = await Product.findById(id).clone();
  product.stock = product.stock - quantity;

  await product.save({ validateBeforeSave: false });
}

//Delete order

exports.deleteOrder = async (req, resp) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return resp.status(500).json({
        success: false,
      });
    }
    resp.status(200).json({
      success: true,
    });
  } catch (error) {
    resp.status(500).json({
      success: true,
      message: error,
    });
  }
};
