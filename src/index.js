const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./auth");
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");
const curriculumRoutes = require("./routes/curriculum");
const mentorRoutes = require("./routes/mentor");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use("/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/curriculum", curriculumRoutes);
app.use("/api/mentor", mentorRoutes);

app.get("/", (req, res) => {
  res.json({ message: "cogni 2.0 API" });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
