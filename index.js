require("dotenv").config();
const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 8000;
const mongoose = require("mongoose");
const credentials = require("./credentials.json");

const admin = require("firebase-admin");

// // Initialize the Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(credentials),
});

const helmet = require("helmet");

const signUpRoute = require("./routes/signup.routes");

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: ["https://lovebirdz-391210.web.app"],
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

app.use(express.json({ limit: "10mb" }));

app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// routes
app.use("/api", signUpRoute);

app.listen(port, () => {
  console.log("Server running on port", port);
});
