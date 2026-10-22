const mongoose = require("mongoose");

const RegisterSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  profilePic: {
    type: String, // will store base64 image
    default: "",
  },
});
//2 parameters=first is register(collection ),second is our schema
const RegisterModel = mongoose.model("register", RegisterSchema);
module.exports = RegisterModel;
