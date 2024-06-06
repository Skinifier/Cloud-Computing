// app.js

const express = require('express');
const path = require('path');

var admin = require("firebase-admin");
var serviceAccount = require("../caps-devs-firebase-adminsdk-in2f4-fa4049fe8e.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
const port = parseInt(process.env.PORT) || process.argv[3] || 8080;

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});

app.use(express.json());

// Import routes
const Routes = require('./routes.js');
app.use(Routes);
