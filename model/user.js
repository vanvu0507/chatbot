const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: String,
  password: String,
  phoneNumber: Number,
  firstName: String,
  lastName: String,
  birthday: Date,
  sex: String,
  socketId: String,
  hangout: [
    {
      receiver: String,
      text: String,
      time: Date
    }
  ],
  friendList: [
    {
      foreName: String
    }
  ]
});

const User = new mongoose.model('User',userSchema)

module.exports = User