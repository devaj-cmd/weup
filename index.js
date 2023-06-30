require("dotenv").config();
const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 8000;
const mongoose = require("mongoose");

const admin = require("firebase-admin");

const helmet = require("helmet");

const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

const signUpRoute = require("./routes/signup.routes");

const serviceAccount = {
  type: process.env.FIREBASE_SERVICE_ACCOUNT_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: privateKey,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
  universe_domain: process.env.UNIVERSE_DOMAIN,
};
const app = express();

app.use(helmet());

app.use(
  cors({
    origin: ["https://lovebirdz-391210.web.app", "http://127.0.0.1:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

mongoose
  .connect(process.env.uri)
  .then(() => {
    console.log("Connected to MongoDB!");
    // initial();
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB", err);
  });

// // Initialize the Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.use(express.json({ limit: "10mb" }));

app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// routes
app.use("/api", signUpRoute);

app.listen(port, () => {
  console.log("Server running on port", port);
});
