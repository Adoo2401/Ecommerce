const Product = require("../models/productModel");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const cloudinary =require("cloudinary");

//Create Product -- Admin
exports.createProduct = async (req, resp, next) => {
  
  try{

    let imagesLink=[];

    
    
    if(req.files.images.length===undefined){
     
      const result=await cloudinary.v2.uploader.upload(req.files.images.tempFilePath,{
        folder:"products"
      })

      imagesLink.push({
        public_id:result.public_id,
        url:result.secure_url
      })


    }else{
      for(var i=0;i<req.files.images.length;i++){

        const result=await cloudinary.v2.uploader.upload(req.files.images[i].tempFilePath,{
          folder:"products"
        })
  
        imagesLink.push({
          public_id:result.public_id,
          url:result.secure_url
        })
  
      }
  
    }

    req.body.images=imagesLink;



    const { token } = req.cookies;
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.body.user = decodedData.id;

    

    const product = await Product.create(req.body);

    resp.status(201).json({
      success: true,
      product,
    });
  }catch(err){
    console.log(err)
  }
  
};

//Get all products
exports.getAllProducts = async (req, resp) => {
  try {
    const products = await Product.find().clone();
    resp.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    resp.status(500).json({
      success: false,
      error,
    });
  }
};

//update product --Admin

exports.updateProduct = async (req, resp, next) => {
  try {

    let products = await Product.findById(req.params.id).clone();

    let imagesLink=[];

    if(req.files===null){

      req.body.images=products.images
      
    }else{

      for(var i=0;i<products.images.length;i++){
        await cloudinary.v2.uploader.destroy(products.images[i].public_id);
      }

      

      if(req.files.images.length===undefined){

        const result=await cloudinary.v2.uploader.upload(req.files.images.tempFilePath,{
          folder:"products"
        })
  
        imagesLink.push({
          public_id:result.public_id,
          url:result.secure_url
        })

        req.body.images=imagesLink

      }else{

      
      for(var i=0;i<req.files.images.length;i++){


        
       const result= await cloudinary.v2.uploader.upload(req.files.images[i].tempFilePath,{
        folder:"products",
       });


       imagesLink.push({
        public_id:result.public_id,
        url:result.secure_url
       })


      }
  
      req.body.images=imagesLink;
    }
      
  }


    
    if (products == null) {
      return resp.status(500).json({
        success: false,
        message: "Product not found",
      });
    }

    products = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }).clone();

    resp.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    resp.status(500).json({
      success: false,
      error,
    });
  }
};

//Delete Product

exports.deleteProduct = async (req, resp, next) => {
  try {
    const products = await Product.findById(req.params.id).clone();

    if (products == null) {
      return resp.status(500).json({
        success: false,
        message: "Product not found",
      });
    }

    console.log(products);


    for(var i=0 ; i<products.images.length;i++){
      await cloudinary.uploader.destroy(products.images[i].public_id)
    }

    

    await Product.findByIdAndDelete(req.params.id).clone();
    resp.status(200).json({
      success: true,
      message: "Product Deleted",
    });
  } catch (error) {
    resp.status(500).json({
      success: false,
      error,
    });
  }
};

//Get single product Details

exports.getSingleProduct = async (req, resp, next) => {
  try {
    const products = await Product.findById(req.params.id).clone();

    if (products == null) {
      return resp.status(500).json({
        success: false,
        message: "Product not found",
      });
    }

    resp.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    resp.status(500).json({
      success: false,
      error,
    });
  }
};

//Search api

exports.productSearch = async (req, resp) => {
  try {
    
    const resultPerPage = 8;
    const productCount = await Product.countDocuments({name:{$regex:req.query.keyword,$options:"i"}});
    const currentPage = Number(req.query.page) || 1;

    const skip = resultPerPage * (currentPage - 1);
    const product = await Product.find({
      name: {
        $regex: req.query.keyword,
        $options: "i",
      },
    }).limit(resultPerPage).skip(skip).clone();

    
    if (product.length == 0) {
      return resp.status(400).json({
        success: true,
        message: "No product Found",
      });
    }
    resp.status(200).json({
      success: true,
      product,
      productCount,
      resultPerPage,
    });
  } catch (error) {
    resp.status(500).json({
      success: false,
      error,
    });
  }
};

//filtering products with category

exports.productFilter = async (req, resp) => {
  try {
    const product = await Product.find({
      category: req.query.category,
    }).clone();

    if (product.length == 0) {
      return resp.status(500).json({
        success: false,
        message: "No product Found",
      });
    }
    resp.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    resp.status(500).json({
      success: false,
      error,
    });
  }
};

//filtering products with price
exports.productPrice = async (req, resp) => {
  try {
    const resultPerPage = 8;
    const productCount = await Product.countDocuments({$and: [
      { price: { $gt: req.query.gt } },
      { price: { $lt: req.query.lt } },
    ],});
    const currentPage = Number(req.query.page) || 1;

    const skip = resultPerPage * (currentPage - 1);
    
      const product = await Product.find({
        $and: [
          { price: { $gt: req.query.gt } },
          { price: { $lt: req.query.lt } },
        ],
      }).limit(resultPerPage).skip(skip).clone();
      
      

      if (product.length == 0) {
        return resp.status(500).json({
          success: false,
          message: "No product Found",
        });
      }
      resp.status(200).json({
        success: true,
        product,
        productCount,
      resultPerPage,
      });
    
  } catch (error) {
    resp.status(500).json({
      success: false,
      error,
    });
  }
};

//pagination

exports.productPagination = async (req, resp) => {
  try {
    const resultPerPage = 8;
    const productCount = await Product.countDocuments();
    const currentPage = Number(req.query.page) || 1;

    const skip = resultPerPage * (currentPage - 1);
    const paginationProduct = await Product.find()
      .limit(resultPerPage)
      .skip(skip).clone();

    resp.status(200).json({
      success: true,
      product:paginationProduct,
      productCount,
      resultPerPage,
      
    });
  } catch (error) {
    resp.status(500).json({
      success: false,
      error,
    });
  }
};

//adding review or update the review

exports.addUpdateReview = async (req, resp) => {
  const { token } = req.cookies;
  

  const decode_token = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decode_token.id).clone();

  const review = {
    user: decode_token.id,
    name: user.name,
    rating: Number(req.body.rating),
    comment: req.body.comment,
  };

  const product = await Product.findById(req.body.productId).clone();

  const isReviewd = await product.reviews.find(
    (elm) => elm.user.toString() == decode_token.id
  );

  if (isReviewd) {
    product.reviews.forEach((elm) => {
      if (elm.user.toString() == decode_token.id) {
        elm.rating = req.body.rating;
        elm.comment = req.body.comment;
      }
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  var avg = 0;

  

  product.reviews.forEach((elm) => {
    avg += elm.rating;
  });

  product.rating = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });
  resp.status(200).json({
    success: true,
  });
};

//get all reviews of single product

exports.getReviewSingle = async (req, resp) => {
  const product = await Product.findById(req.query.id);

  if (!product) {
    return resp.status(500).json({
      success: false,
      message: "No product found",
    });
  }

  resp.status(200).json({
    success: true,
    reviews: product.reviews,
  });
};

//delete review

exports.deleteReview = async (req, resp) => {


  const product = await Product.findById(req.query.productId);


  if (!product) {
    return resp.status(500).json({
      succces: false,
      message: "No product Found",
    });
  }

  const reviews = product.reviews.filter(
    (elm) => elm._id.toString() != req.query.id
  );



  var avg = 0;

  reviews.forEach((elm) => {
    avg += elm.rating;
  });

  let rating=0;


  if(reviews.length===0){

    rating=0;

  }else{
    rating = avg / reviews.length;
  }

  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      rating,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  resp.send({
    success: true,
  });
};


//Fiter product with category


exports.filterRatingProduct=async(req,resp)=>{
  try {
    
    const product=await Product.find({rating:{$gte:req.query.rating}});
   
    if(product.length==0){
     return resp.status(404).json({
        success:false,
        message:"NO product Found"
      })
    }

    resp.status(200).json({
      success:true,
      product,
    })


  } catch (error) {
    resp.status(500).json({
      success:false,
      error,
    })
  }
}


//ADmin route for all the products


exports.getAllAdminProducts=async(req,resp)=>{
  try {

    const products=await Product.find().clone();

    resp.status(200).json({
      products,
      success:true
    })
    


  } catch (error) {
    resp.status(500).json({
      success:false,
      error,
    })
  }
}