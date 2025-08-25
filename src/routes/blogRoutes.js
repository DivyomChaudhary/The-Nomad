import express from "express";
import mongoose from "mongoose";
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

import upload from '../utils/upload.js';
import { Blog, DefaultBlog } from "../models/blog.js";
import User from "../models/user.js";

const router = express.Router();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const theDate = new Date().getFullYear();

router.get('/', (req, res) => {
    res.redirect('/main');
});

router.get("/main", async (req, res) => {
  try {
    // Fetch all user-submitted blogs from the 'blogs' collection
    const userBlogs = await Blog.find({});
    // Fetch all default blogs from the 'defaultblogs' collection
    const defaultBlogs = await DefaultBlog.find({});
    res.render("index.ejs", {
      thisYear: theDate,
      newBlog: userBlogs,
      defaultBlogs: defaultBlogs,
    });
  } catch (err) {
    console.error("Error retrieving blogs:", err);
    res.status(500).send("Error retrieving blogs.");
  }
});

router.get("/admin", (req, res) => {
  res.render("auth.ejs", {
    thisYear: theDate,
    error: false,
  });
});

router.post("/submit", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username: username, password: password });

        if (user) {
            res.render("new-blog.ejs", {
                adminName: user.username,
                thisYear: theDate,
            });
        } else {
            res.render("auth.ejs", {
                thisYear: theDate,
                error: true,
                message: "Invalid username or password.",
            });
        }
    } catch (err) {
        console.error("Login error:", err);
        res.render("auth.ejs", {
            thisYear: theDate,
            error: true,
            message: "An error occurred during login.",
        });
    }
});

router.get("/signup", (req, res) => {
    res.render("signup.ejs", {
        thisYear: theDate,
        error: false,
        message: null
    });
});

router.post("/signup", async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.render("signup.ejs", {
                thisYear: theDate,
                error: true,
                message: "Username already exists. Please choose a different one."
            });
        }
        
        const newUser = new User({ username, password });
        await newUser.save();
        res.redirect("/admin"); // Redirect to auth.ejs
    } catch (err) {
        console.error("Error creating user:", err);
        let errorMessage = "Error creating user.";
        if (err.code === 11000) {
            errorMessage = "Username already exists. Please choose a different one.";
        }
        res.render("signup.ejs", {
            thisYear: theDate,
            error: true,
            message: errorMessage
        });
    }
});

// Route to upload a new blog, saving it to MongoDB
router.post("/upload", upload.single("highlight"), async (req, res) => {
  console.log(req.body);
  console.log(req.file);

  try {
    const { titleName, authorName, description } = req.body;
    // Capture the S3 URL from req.file.location
    // If no file is uploaded, image will be null
    const image = req.file ? req.file.location : null;

    // Create a new document instance with the provided data
    const newBlogEntry = new Blog({
      title: titleName,
      author: authorName,
      description: description,
      image: image, //* Store the S3 URL in the database
    });

    // Save the document to the 'blogs' collection
    await newBlogEntry.save();
    return res.redirect("/main");
  } catch (err) {
    console.error("Error saving blog entry:", err);
    return res.status(500).send("Error saving blog entry.");
  }
});

router.post("/remove", async (req, res) => {
  try {
    const blogId = req.body.id;

    if (!mongoose.isValidObjectId(blogId)) {
      console.error("Invalid Blog ID format:", blogId);
      return res.status(400).send("Invalid Blog ID.");
    }

    const deletedBlog = await Blog.findByIdAndDelete(blogId);
    if (!deletedBlog) {
      console.log("Blog not found with the given ID.");
      return res.status(404).send("Blog not found.");
    }

    // Delete the associated image file from S3
    if (deletedBlog.image) {
      // Create a URL object to correctly parse the pathname, normal bucket name was throwing errors
      const urlObject = new URL(deletedBlog.image);
      // The pathname starts with a slash, so we slice it off to get the key
      const s3Key = urlObject.pathname.slice(1);

      if (s3Key) {
        const deleteParams = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: s3Key,
        };
        console.log("Attempting to delete image from S3 with key:", s3Key);
        try {
          await s3.send(new DeleteObjectCommand(deleteParams));
          console.log("Image deleted successfully from S3:", s3Key);
        } catch (s3Err) {
          console.error("Error deleting image from S3:", s3Err);
        }
      } else {
          console.warn("Could not extract S3 key from image URL:", deletedBlog.image);
      }
    }
    console.log("Blog entry and S3 image deletion process complete.");
    res.redirect("/main");
  } catch (err) {
    console.error("Error deleting blog entry:", err);
    res.status(500).send("Error deleting blog entry.");
  }
});

// Route to view a specific blog by its unique ID
router.get("/new-blog/:id", async (req, res) => {
  try {
    const blogId = req.params.id;
    const blog = await Blog.findById(blogId);
    if (blog) {
      res.render("index-blog.ejs", {
        titleName: blog.title,
        authorName: blog.author,
        image: blog.image,
        description: blog.description,
        thisYear: theDate,
      });
    } else {
      res.status(404).send("Blog not found");
    }
  } catch (err) {
    console.error("Error finding blog:", err);
    res.status(500).send("Error finding blog.");
  }
});

router.get("/blog/get-inspired", async (req, res) => {
  const defaultBlogs = await DefaultBlog.find({});
  const blog = defaultBlogs.find((b) => b.description.startsWith("It is true"));
  if (blog) {
    res.render("index-blog.ejs", {
      titleName: "Get Inspired",
      authorName: "John Doe",
      description: blog.description,
      image: blog.image,
      thisYear: theDate,
    });
  } else {
    res.status(404).send("Blog not found");
  }
});

router.get("/blog/how-to-save-for-a-trip", async (req, res) => {
  const defaultBlogs = await DefaultBlog.find({});
  const blog = defaultBlogs.find((b) =>
    b.description.startsWith("The key to any trip")
  );
  if (blog) {
    res.render("index-blog.ejs", {
      titleName: "How to Save for a Trip",
      authorName: "John Doe",
      description: blog.description,
      image: blog.image,
      thisYear: theDate,
    });
  } else {
    res.status(404).send("Blog not found");
  }
});

router.get("/blog/how-to-plan-a-trip", async (req, res) => {
  const defaultBlogs = await DefaultBlog.find({});
  const blog = defaultBlogs.find((b) =>
    b.description.startsWith("Planning your trip")
  );
  if (blog) {
    res.render("index-blog.ejs", {
      titleName: "How to Plan a Trip",
      authorName: "John Doe",
      description: blog.description,
      image: blog.image,
      thisYear: theDate,
    });
  } else {
    res.status(404).send("Blog not found");
  }
});

router.get("/blog/finding-accomodation", async (req, res) => {
  const defaultBlogs = await DefaultBlog.find({});
  const blog = defaultBlogs.find((b) =>
    b.description.startsWith("Accommodation will")
  );
  if (blog) {
    res.render("index-blog.ejs", {
      titleName: "Finding Accomodation",
      authorName: "John Doe",
      description: blog.description,
      image: blog.image,
      thisYear: theDate,
    });
  } else {
    res.status(404).send("Blog not found");
  }
});

router.get("/blog/solo-female", async (req, res) => {
  const defaultBlogs = await DefaultBlog.find({});
  const blog = defaultBlogs.find((b) =>
    b.description.startsWith("Traveling the world")
  );
  if (blog) {
    res.render("index-blog.ejs", {
      titleName: "Solo Female Travel",
      authorName: "John Doe",
      description: blog.description,
      image: blog.image,
      thisYear: theDate,
    });
  } else {
    res.status(404).send("Blog not found");
  }
});

router.get("/blog/family-travel", async (req, res) => {
  const defaultBlogs = await DefaultBlog.find({});
  const blog = defaultBlogs.find((b) =>
    b.description.startsWith("Family travel")
  );
  if (blog) {
    res.render("index-blog.ejs", {
      titleName: "Family Travel",
      authorName: "John Doe",
      description: blog.description,
      image: blog.image,
      thisYear: theDate,
    });
  } else {
    res.status(404).send("Blog not found");
  }
});

router.get("/blog/travel-scams-to-avoid", async (req, res) => {
  const defaultBlogs = await DefaultBlog.find({});
  const blog = defaultBlogs.find((b) =>
    b.description.startsWith("Travel scams are real")
  );
  if (blog) {
    res.render("index-blog.ejs", {
      titleName: "5 Travel Scams to Avoid",
      authorName: "John Doe",
      description: blog.description,
      image: blog.image,
      thisYear: theDate,
    });
  } else {
    res.status(404).send("Blog not found");
  }
});

router.get("/about", (req, res) => {
  res.render("about.ejs", {
    thisYear: theDate,
  });
});

export default router;
