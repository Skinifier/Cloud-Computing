const express = require("express");
const {
  registerUser,
  loginUser,
  addBarang,
  updateBarang,
  deleteBarang,
  getBarang,
  getBarangById,
  getBarangByUser,
  addWishlist,
  getWishlist,
  deleteWishlist,
  getProfile,
  updateProfile,
  addArticle,
  getArticle,
  getArticleById,
  updateArticle,
  deleteArticle,
} = require("./handlers.js");
const { authenticateToken } = require("../middleware/middleware.js");
const router = express.Router();
const upload = require("../storage/multer.js");

// Users
router.post("/register", registerUser);
router.post("/login", loginUser); // New login route
router.get("/users", authenticateToken, getProfile);
router.put("/users", authenticateToken, upload.single("foto"), updateProfile);

// Barang
router.get("/barang", authenticateToken, getBarang);
router.get("/barang/users", authenticateToken, getBarangByUser);
router.get("/barang/:id", authenticateToken, getBarangById);

router.post("/barang", authenticateToken, upload.array("foto", 2), addBarang);
router.put(
  "/barang/:id",
  authenticateToken,
  upload.array("foto", 2),
  updateBarang
);
router.delete("/barang/:id", authenticateToken, deleteBarang);

// Wishlist
router.post("/wishlist", authenticateToken, addWishlist);
router.get("/wishlist", authenticateToken, getWishlist);
router.delete("/wishlist/:id", authenticateToken, deleteWishlist);

// Article
router.post("/articles", upload.single("foto"), addArticle);
router.get("/articles", authenticateToken, getArticle);
router.get("/articles/:id", authenticateToken, getArticleById);
router.put("/articles/:id", upload.single("foto"), updateArticle);
router.delete("/articles/:id", deleteArticle);

module.exports = router;
