const express = require('express');
const { getUsers, registerUser, loginUser, addBarang, getBarang } = require('./handlers.js');

const router = express.Router();

// Users
router.get('/user', getUsers);
router.post('/register', registerUser);
router.post('/login', loginUser); // New login route

// Barang
router.get('/barang', getBarang);
router.post('/barang', addBarang);

module.exports = router;
