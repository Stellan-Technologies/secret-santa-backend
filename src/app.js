const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./config/db");

const participantRoutes = require("./routes/participantRoutes");
const drawRoutes = require("./routes/drawRoutes");
const roomRoutes = require("./routes/roomRoutes");   // ⭐ IMPORTANT

const app = express();
app.use(express.json());

// ------------------ CORS CONFIG ------------------
const allowedOrigins = [
  "http://localhost:5173",
  "https://secret-santa-local.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.log("❌ Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
// -------------------------------------------------

// ⭐ REGISTER ROOM ROUTES FIRST
app.use("/api/rooms", roomRoutes);

// OTHER ROUTES
app.use("/api/participants", participantRoutes);
app.use("/api/draw", drawRoutes);

module.exports = app;
