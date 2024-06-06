// Handlers.js

const admin = require("firebase-admin");
const db = admin.firestore();

//USERS
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

//BARANG
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
  addBarang
};
