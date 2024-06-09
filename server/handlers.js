const admin = require("firebase-admin");
const db = admin.firestore();

// USERS
const getUsers = async (req, res) => {
  try {
    const snapshot = await db.collection("user").get();
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const registerUser = async (req, res) => {
  try {
    const data = req.body;
    await db.collection("user").add(data);
    res.status(201).send("Data added successfully");
  } catch (error) {
    res.status(500).send(error.message);
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
    if (userData.password != password) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }
    res.status(200).json({
      id: userId,
      email: userData.usemame,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({
      message: "Failed to login",
    });
  }
};

// BARANG
const getBarang = async (req, res) => {
  try {
    const snapshot = await db.collection("barang").get();
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const addBarang = async (req, res) => {
  try {
    const {
      id_user,
      nama_barang,
      nama_brand,
      deskripsi,
      harga,
      jenis_produk,
      foto,
      bahan,
    } = req.body;

    // Validate request body
    if (
      !id_user ||
      !nama_barang ||
      !nama_brand ||
      !deskripsi ||
      !harga ||
      !jenis_produk ||
      !foto ||
      !bahan
    ) {
      return res.status(400).send("All fields are required");
    }

    const newBarang = {
      id_user,
      nama_barang,
      nama_brand,
      deskripsi,
      harga,
      jenis_produk,
      foto,
      bahan,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("barang").add(newBarang);

    res.status(201).send("Barang added successfully");
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// WISHLIST
const addWishlist = async (req, res) => {
  try {
    const { id_user, id_barang, jumlah_barang } = req.body;

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
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const wishlistQuerySnapshot = await db
      .collection("wishlist")
      .where("id_user", "==", id)
      .get();

    const wishlistData = wishlistQuerySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return res.status(200).json(wishlistData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUsers,
  registerUser,
  getBarang,
  addBarang,
  loginUser,
  addWishlist,
  getWishlist,
};
