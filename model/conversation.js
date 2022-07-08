const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const conversationSchema = new Schema({
  members: [] ,
  conversation: [
    {
     receiverId: String,
     senderId: String,
     text: String,
     createAt: String  
    }
  ]
});

const Conversation = new mongoose.model('Conversation',conversationSchema)

module.exports = Conversation