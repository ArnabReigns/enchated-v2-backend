const mongoose = require("mongoose");

const UesrSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  rooms: [],
});

const User = mongoose.model("User", UesrSchema);

module.exports = User;
