require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./config/db");
const errorHandler = require("./errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/api/health", async (req, res) => {
  try {
    await db.query("SELECT 1");

    res.json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    res.status(503).json({
      status: "error",
      database: "unavailable",
    });
  }
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`BIS-SAKHI backend running on http://localhost:${PORT}`);
});