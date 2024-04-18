const express = require("express");
const cors = require("cors");
const { ERROR } = require("./utils/httpStatusText");
require("dotenv").config();
require("./DB/DBConnect");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

// import Router
const teachersRouter = require("./routes/teacher.route");
const ownersRouter = require("./routes/owner.route");

// use Router
app.use("/api/v1/teachers", teachersRouter);
app.use("/api/v1/owners", ownersRouter);

// global middleware for not found router
app.all("*", (req, res) => {
  return res
    .status(404)
    .json({ status: ERROR, message: "this resource is not available" });
});

// global error handler
app.use((error, req, res, next) => {
  res.status(error.code || 500).json({
    status: error.statusText || ERROR,
    message: error.message,
    code: error.code || 500,
  });
});

app.listen(port || 8000, () => {
  console.log("listen on port:", port);
});
