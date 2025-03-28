import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  categories: {
    type: [String],
    required: true,
    default: []
  },
  cover: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  readTime: {
    value: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      enum: ['minuti', 'minuto'],
      default: 'minuti'
    }
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  ratings: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    }
  }]
}, {timestamps: true});

const Post = mongoose.model("Post", postSchema);

export default Post;