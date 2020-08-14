const mongoose = require("mongoose");
const moment = require('moment');

const StorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim:true
  },
  body: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: 'private',
    enum: ['public','private']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  image: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

module.exports = mongoose.model("Story", StorySchema);
