const admin = require("firebase-admin");
const db = admin.firestore();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const uploadFileToGCS = require("../storage/upload.js");
const { extractToken } = require("../middleware/middleware.js");
const convertTimestampToDate = require("../utils/date.js");
require("dotenv").config();

// USERS
const registerUser = async (req, res) => {
  try {
    const { email, username, fullname, no_hp, skin_type, password } = req.body;
    if (!email || !username || !fullname || !no_hp || !skin_type || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userQuerySnapshot = await db
      .collection("user")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (!userQuerySnapshot.empty) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash Password
    const salt = 10;
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      email,
      username,
      fullname,
      no_hp,
      skin_type,
      password: hashedPassword,
      photo: null,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("user").add(newUser);
    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to register user" });
  }
};

const getProfile = async (req, res) => {
  try {
    const id_user = extractToken(req);
    if (!id_user) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const user = await db.collection("user").doc(id_user).get();
    if (!user.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = user.data();
    const profileData = {
      id: user.id,
      no_hp: userData.no_hp,
      fullname: userData.fullname,
      skin_type: userData.skin_type,
      email: userData.email,
      username: userData.username,
      photo: userData.photo || null,
    };

    return res.status(200).json(profileData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const id_user = extractToken(req);
    if (!id_user) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const userRef = db.collection("user").doc(id_user);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = userDoc.data();

    const { email, username, fullname, no_hp, skin_type } = req.body;
    let photo = userData.photo;

    if (req.file) {
      const tempFilePath = req.file.path;
      photo = await uploadFileToGCS(tempFilePath);
    }

    const updatedUser = {
      email: email || userData.email,
      username: username || userData.username,
      fullname: fullname || userData.fullname,
      no_hp: no_hp || userData.no_hp,
      skin_type: skin_type || userData.skin_type,
      photo: photo || userData.photo,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    await userRef.set(updatedUser, {
      merge: true,
      ignoreUndefinedProperties: true,
    });
    return res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Query Firestore for user based on email
    const userQuerySnapshot = await db
      .collection("user")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (userQuerySnapshot.empty) {
      return res.status(401).json({
        message: "Invalid email",
      });
    }
    const userData = userQuerySnapshot.docs[0].data();
    const userId = userQuerySnapshot.docs[0].id;

    // Compare password
    const passwordMatch = await bcrypt.compare(password, userData.password);
    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    const token = jwt.sign(
      { id: userId, email: userData.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      user: {
        id: userId,
        email: userData.email,
      },
      token,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json({
      message: "Failed to login",
    });
  }
};

// BARANG
const getBarang = async (req, res) => {
  try {
    let query = db.collection("barang");
    const { skin_type, name_brand } = req.query;

    if (skin_type) {
      const modifiedSkinType = skin_type
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());
      query = query.where("skin_type", "==", modifiedSkinType);
    }

    if (name_brand) {
      const modifiedNameBrand = name_brand
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());
      // Mencari dengan huruf yang mengandung
      query = query
        .where("nama_brand", ">=", modifiedNameBrand)
        .where("nama_brand", "<=", modifiedNameBrand + "\uf8ff");
    }

    const snapshot = await query.get();
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      created_at: convertTimestampToDate(doc.data().created_at),
      updated_at: convertTimestampToDate(doc.data().updated_at),
    }));

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getBarangById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Barang ID is required" });
    }

    const barang = await db.collection("barang").doc(id).get();
    if (!barang.exists) {
      return res.status(404).json({ error: "Barang not found" });
    }

    return res.status(200).json({
      id: barang.id,
      ...barang.data(),
      created_at: convertTimestampToDate(barang.data().created_at),
      updated_at: convertTimestampToDate(barang.data().updated_at),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getBarangByUser = async (req, res) => {
  try {
    const id_user = extractToken(req);

    if (!id_user) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const barangQuerySnapshot = await db
      .collection("barang")
      .where("id_user", "==", id_user)
      .get();

    const barangData = barangQuerySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      created_at: convertTimestampToDate(doc.data().created_at),
      updated_at: convertTimestampToDate(doc.data().updated_at),
    }));

    return res.status(200).json(barangData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const addBarang = async (req, res) => {
  try {
    const {
      nama_barang,
      nama_brand,
      deskripsi,
      harga,
      no_hp,
      jenis_produk,
      skin_type,
      bahan,
      domisili,
    } = req.body;

    const id_user = extractToken(req);

    // Validate request body
    if (
      !id_user ||
      !nama_barang ||
      !nama_brand ||
      !deskripsi ||
      !harga ||
      !no_hp ||
      !jenis_produk ||
      !skin_type ||
      !bahan ||
      !domisili ||
      !req.files
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (req.files.length > 2) {
      return res.status(400).json({ error: "Maximum 2 photos allowed" });
    }

    // Upload file foto ke Google Cloud Storage
    const photoUrls = [];
    for (const file of req.files) {
      try {
        const tempFilePath = file.path;
        const photoUrl = await uploadFileToGCS(tempFilePath);
        photoUrls.push(photoUrl);
      } catch (error) {
        return res.status(500).json({ error: "Failed to upload photos" });
      }
    }

    const capitalizeFirstLetter = (string) => {
      return string.charAt(0).toUpperCase() + string.slice(1);
    };

    const newBarang = {
      id_user,
      nama_barang: capitalizeFirstLetter(nama_barang),
      nama_brand: capitalizeFirstLetter(nama_brand),
      deskripsi,
      harga,
      no_hp,
      jenis_produk,
      skin_type: capitalizeFirstLetter(skin_type),
      foto1: photoUrls[0] || "",
      foto2: photoUrls[1] || "",
      bahan,
      domisili,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("barang").add(newBarang);

    return res.status(201).json({ message: "Barang added successfully" });
  } catch (error) {
    console.error("Error adding barang:", error);
    return res.status(500).json({ error: error.message });
  }
};

const updateBarang = async (req, res) => {
  try {
    const { id } = req.params;
    const id_user = extractToken(req);

    if (!id_user) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const barangRef = db.collection("barang").doc(id);
    const barangDoc = await barangRef.get();

    if (!barangDoc.exists) {
      return res.status(404).json({ error: "Barang not found" });
    }

    const barangData = barangDoc.data();

    if (barangData.id_user !== id_user) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const {
      nama_barang,
      nama_brand,
      deskripsi,
      harga,
      no_hp,
      jenis_produk,
      bahan,
      domisili,
    } = req.body;

    const updatedBarang = {
      nama_barang: nama_barang || barangData.nama_barang,
      nama_brand: nama_brand || barangData.nama_brand,
      deskripsi: deskripsi || barangData.deskripsi,
      harga: harga || barangData.harga,
      no_hp: no_hp || barangData.no_hp,
      jenis_produk: jenis_produk || barangData.jenis_produk,
      bahan: bahan || barangData.bahan,
      domisili: domisili || barangData.domisili,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (req.files && req.files.length > 0) {
      const photoUrls = [];
      for (const file of req.files) {
        const tempFilePath = file.path;
        const photoUrl = await uploadFileToGCS(tempFilePath);
        photoUrls.push(photoUrl);
      }
      updatedBarang.foto1 = photoUrls[0] || barangData.foto1 || "";
      updatedBarang.foto2 = photoUrls[1] || barangData.foto2 || "";
    }

    await barangRef.update(updatedBarang);

    return res.status(200).json({ message: "Barang updated successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deleteBarang = async (req, res) => {
  try {
    const { id } = req.params;
    const id_user = extractToken(req);

    if (!id_user) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const barangRef = db.collection("barang").doc(id);
    const barangDoc = await barangRef.get();

    if (!barangDoc.exists) {
      return res.status(404).json({ error: "Barang not found" });
    }

    const barangData = barangDoc.data();

    if (barangData.id_user !== id_user) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await barangRef.delete();
    return res.status(200).json({ message: "Barang deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// WISHLIST
const addWishlist = async (req, res) => {
  try {
    const { id_barang, jumlah_barang } = req.body;
    const id_user = extractToken(req);

    // Validate request body
    if (!id_user || !id_barang || !jumlah_barang) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const user = await db.collection("user").doc(id_user).get();
    if (!user.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const barang = await db.collection("barang").doc(id_barang).get();
    if (!barang.exists) {
      return res.status(404).json({ error: "Barang not found" });
    }

    const wishlistQuerySnapshot = await db
      .collection("wishlist")
      .where("id_user", "==", id_user)
      .where("id_barang", "==", id_barang)
      .get();

    if (!wishlistQuerySnapshot.empty) {
      return res
        .status(400)
        .json({ error: "Item already exists in the wishlist" });
    }

    const newWishlist = {
      id_user,
      id_barang,
      jumlah_barang,
    };

    await db.collection("wishlist").add(newWishlist);
    return res.status(201).json({ message: "Wishlist added successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getWishlist = async (req, res) => {
  try {
    const id_user = extractToken(req);
    if (!id_user) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const wishlistQuerySnapshot = await db
      .collection("wishlist")
      .where("id_user", "==", id_user)
      .get();

    if (wishlistQuerySnapshot.empty) {
      return res.status(200).json({ message: "No wishlist data found" });
    }

    const wishlistData = wishlistQuerySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return res.status(200).json(wishlistData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deleteWishlist = async (req, res) => {
  try {
    const { id } = req.params;
    const id_user = extractToken(req);

    if (!id_user) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const wishlistRef = db.collection("wishlist").doc(id);
    const wishlistDoc = await wishlistRef.get();

    if (!wishlistDoc.exists) {
      return res.status(404).json({ error: "Wishlist item not found" });
    }

    const wishlistData = wishlistDoc.data();

    if (wishlistData.id_user !== id_user) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await wishlistRef.delete();
    return res
      .status(200)
      .json({ message: "Wishlist item deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Article
const addArticle = async (req, res) => {
  try {
    const { judul, deskripsi } = req.body;

    // Validate request body
    if (!judul || !deskripsi || !req.file) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Upload file foto ke Google Cloud Storage
    const tempFilePath = req.file.path;
    const fotoUrl = await uploadFileToGCS(tempFilePath);

    const newArticle = {
      judul,
      deskripsi,
      foto: fotoUrl,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("article").add(newArticle);

    return res.status(201).json({ message: "Article added successfully" });
  } catch (error) {
    console.error("Error adding article:", error);
    return res.status(500).json({ error: error.message });
  }
};

const getArticle = async (req, res) => {
  try {
    const snapshot = await db.collection("article").get();
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      created_at: convertTimestampToDate(doc.data().created_at),
      updated_at: convertTimestampToDate(doc.data().updated_at),
    }));

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Article ID is required" });
    }

    const article = await db.collection("article").doc(id).get();
    if (!article.exists) {
      return res.status(404).json({ error: "Article not found" });
    }

    return res.status(200).json({
      id: article.id,
      ...article.data(),
      created_at: convertTimestampToDate(article.data().created_at),
      updated_at: convertTimestampToDate(article.data().updated_at),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;

    const articleRef = db.collection("article").doc(id);
    const articleDoc = await articleRef.get();

    if (!articleDoc.exists) {
      return res.status(404).json({ error: "Article not found" });
    }

    const articleData = articleDoc.data();

    const { judul, deskripsi } = req.body;

    const updatedArticle = {
      judul: judul || articleData.judul,
      deskripsi: deskripsi || articleData.deskripsi,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (req.file) {
      const tempFilePath = req.file.path;
      const fotoUrl = await uploadFileToGCS(tempFilePath);
      updatedArticle.foto = fotoUrl;
    }

    await articleRef.update(updatedArticle);

    return res.status(200).json({ message: "Article updated successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;

    const articleRef = db.collection("article").doc(id);
    const articleDoc = await articleRef.get();

    if (!articleDoc.exists) {
      return res.status(404).json({ error: "Article not found" });
    }

    await articleRef.delete();
    return res.status(200).json({ message: "Article deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registerUser,
  getProfile,
  updateProfile,
  getBarang,
  getBarangById,
  getBarangByUser,
  addBarang,
  updateBarang,
  deleteBarang,
  loginUser,
  addWishlist,
  getWishlist,
  deleteWishlist,
  addArticle,
  getArticle,
  getArticleById,
  updateArticle,
  deleteArticle,
};
