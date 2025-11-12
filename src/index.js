const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./auth");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({ message: "cogni 2.0 API" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
