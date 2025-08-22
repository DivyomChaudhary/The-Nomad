import mongoose from "mongoose";

// Schema for user-submitted blogs
const blogSchema = new mongoose.Schema({
    title: String,
    author: String,
    description: String,
    image: String,
});

// Mongoose model for user-submitted blogs
const Blog = mongoose.model("Blog", blogSchema);

// Schema for default blogs
const defaultBlogSchema = new mongoose.Schema({
    image: String,
    description: String,
});

// Mongoose model for default blogs
const DefaultBlog = mongoose.model("DefaultBlog", defaultBlogSchema);

export { Blog, DefaultBlog };