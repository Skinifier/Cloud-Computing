const admin = require("firebase-admin");
const db = admin.firestore();

// USERS
const getUsers = async (req, res) => {
  try {
    const snapshot = await db.collection('user').get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const registerUser = async (req, res) => {
  try {
    const data = req.body;
    await db.collection('user').add(data);
    res.status(201).send('Data added successfully');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Query Firestore for user based on email
    const userQuerySnapshot = await db.collection('user').where('email', '==', email).limit(1).get();
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
      username: userData.username


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
    const snapshot = await db.collection('barang').get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
      bahan
    } = req.body;

    // Validate request body
    if (!id_user || !nama_barang || !nama_brand || !deskripsi || !harga || !jenis_produk || !foto || !bahan) {
      return res.status(400).send('All fields are required');
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
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('barang').add(newBarang);

    res.status(201).send('Barang added successfully');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

module.exports = {
  getUsers,
  registerUser,
  getBarang,
  addBarang,
  loginUser
};
