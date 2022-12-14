const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getSingleProduct,
  productSearch,
  productFilter,
  productPrice,
  productPagination,
  addUpdateReview,
  deleteReview,
  getReviewSingle,
  filterRatingProduct,
  getAllAdminProducts,
} = require("../controllers/productController");

const express = require("express");
const authorizedRoles = require("../middlewares/role")
const isAuthenticated=require("../middlewares/auth")
const router = express.Router();

router.route("/products").get(getAllProducts);
router
  .route("/products/new")
  .post(createProduct);
router
  .route("/products/:id")
  .put( updateProduct)
  .delete(deleteProduct)
  .get(getSingleProduct);

router.route("/search").get(productSearch);
router.route("/filter").get(productFilter);
router.route("/price").get(productPrice);
router.route("/pagination").get(productPagination);
router.route("/review").put( addUpdateReview);
router.route("/allreview").get(getReviewSingle);
router.route("/review/delete").delete( deleteReview);
router.route("/filter_rating").get(filterRatingProduct);
router.route("/admin/products").get(getAllAdminProducts)

module.exports = router;
