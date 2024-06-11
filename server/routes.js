const express = require('express');
const { getUsers, registerUser, loginUser, addBarang, getBarang, addWishlist, getWishlist } = require('./handlers.js');

const router = express.Router();

// Users
router.get('/user', getUsers);
router.post('/register', registerUser);
router.post('/login', loginUser); // New login route

// Barang
router.get('/barang', getBarang);
router.post('/barang', addBarang);

// Wishlist
router.post('/wishlist', addWishlist);
router.get('/wishlist/:id', getWishlist);

module.exports = router;
