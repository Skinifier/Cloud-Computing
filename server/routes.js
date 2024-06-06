const express = require('express');
const { getUsers, registerUser, addBarang, getBarang } = require('./handlers.js');

const router = express.Router();

//users
router.get('/user', getUsers);
router.post('/register', registerUser);

//barang
router.get('/barang', getBarang);
router.post('/barang', addBarang);

module.exports = router;
