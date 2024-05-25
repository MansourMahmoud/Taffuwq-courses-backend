const mongoose = require("mongoose");

const url = process.env.MONGO_URL;

const dbOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // 30 seconds
  socketTimeoutMS: 45000, // 45 seconds
};
mongoose.connect(url, dbOptions).then(() => {
  console.log("mongodb connect success");
});
