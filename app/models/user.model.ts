import * as mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
import { Helper } from "../helper/helper";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Enter you username"],
    unique: [true, "Please enter a valid username"],
  },
  email: {
    type: String,
    required: [true, "Enter you email"],
    unique: [true, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Enter you password"],
  },
});
userSchema.plugin(uniqueValidator, {
  message: "Error, expected {PATH} to be unique.",
});

userSchema.pre("save", async function (next) {
  var user: any = this;
  var encPass = await Helper.generateEncHash(user.password);
  user.password = encPass;
  next();
});

const UserModel = mongoose.model("user", userSchema);

export default UserModel;
