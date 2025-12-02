const express = require("express");
const loginRouter = require("./login");
const registerRouter = require("./register");

const router = express.Router();

router.use("/login", loginRouter);
router.use("/register", registerRouter);

module.exports = router;
