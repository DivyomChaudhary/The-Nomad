import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from "path";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null, "./public/images/uploads");
    },
    filename: function (req, file, cb) {
        return cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

// Connect to Atlas
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Successfully connected to MongoDB Atlas!");
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB Atlas:", err);
    });

// Schema - user submitted
const blogSchema = new mongoose.Schema({
    title: String,
    author: String,
    description: String,
    image: String,
});
// Mongoose model - user-submitted blogs
const Blog = mongoose.model("Blog", blogSchema);

// Schema - default blogs
const defaultBlogSchema = new mongoose.Schema({
    image: String,
    description: String,
});
// Mongoose model - default blogs
const DefaultBlog = mongoose.model("DefaultBlog", defaultBlogSchema);

let defaultBlogs = [];


const theDate = new Date().getFullYear();

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Route to get all blogs and render the main page
app.get("/main", async (req, res) => {
    try {
        // Fetch all user-submitted blogs from the 'blogs' collection
        const userBlogs = await Blog.find({});
        // Fetch all default blogs from the 'defaultblogs' collection
        defaultBlogs = await DefaultBlog.find({});
        res.render("index.ejs", {
            thisYear: theDate,
            newBlog: userBlogs, // newBlog now refers to blogs from the database
            defaultBlogs: defaultBlogs, // Pass default blogs to the template
        });
    } catch (err) {
        console.error("Error retrieving blogs:", err);
        res.status(500).send("Error retrieving blogs.");
    }
});

app.get("/admin", (req, res) => {
    res.render("auth.ejs", {
        thisYear: theDate,
    });
});

const TRUE_USER = process.env.TRUE_USER;
const TRUE_PWD = process.env.TRUE_PWD;

app.post("/submit", (req, res) => {
    var user = req.body["username"];
    var pwd = req.body["password"];
    if (user === TRUE_USER && pwd === TRUE_PWD) {
        res.render("new-blog.ejs", {
            adminName: user,
            thisYear: theDate,
        });
    } else {
        res.render("auth.ejs", {
            thisYear: theDate,
            error: true,
        });
    }
});

// Route to upload a new blog, saving it to MongoDB
app.post("/upload", upload.single("highlight"), async (req, res) => {
    console.log(req.body);
    console.log(req.file);

    try {
        const { titleName, authorName, description } = req.body;
        const image = req.file ? `/images/uploads/${req.file.filename}` : null;

        // Create a new document instance with the provided data
        const newBlogEntry = new Blog({
            title: titleName,
            author: authorName,
            description: description,
            image: image,
        });

        // Save the document to the 'blogs' collection
        await newBlogEntry.save();
        return res.redirect("/main");
    } catch (err) {
        console.error("Error saving blog entry:", err);
        return res.status(500).send("Error saving blog entry.");
    }
});

// Route to remove a blog using MongoDB ID
// Route to remove a blog, deleting both the database entry and the local image file
// Route to remove a blog, deleting both the database entry and the local image file
app.post("/remove", async (req, res) => {
    try {
        const blogId = req.body.id;

        // Step 1: Validate the incoming ID to prevent server crashes
        if (!mongoose.isValidObjectId(blogId)) {
            console.error("Invalid Blog ID format:", blogId);
            return res.status(400).send("Invalid Blog ID.");
        }

        // Step 2: Delete the document from the database
        // findByIdAndDelete returns the document that was deleted, which we need for the image path.
        const deletedBlog = await Blog.findByIdAndDelete(blogId);

        if (!deletedBlog) {
            console.log("Blog not found with the given ID.");
            return res.status(404).send("Blog not found.");
        }

        // Step 3: Delete the associated image file from local storage.
        if (deletedBlog.image) {
            // Use path.basename to get only the filename from the database path.
            const imageFilename = path.basename(deletedBlog.image);

            // Construct the absolute path using __dirname for a reliable path.
            const imagePath = path.join(__dirname, 'public', 'images', 'uploads', imageFilename);
            
            console.log("Attempting to delete image at:", imagePath);

            try {
                await fs.unlink(imagePath);
                console.log("Image deleted successfully:", imagePath);
            } catch (fsErr) {
                // Check if the error is because the file doesn't exist (ENOENT)
                if (fsErr.code === 'ENOENT') {
                    console.warn("File not found, but DB entry was deleted:", imagePath);
                } else {
                    console.error("Error deleting image file:", fsErr);
                }
            }
        }

        console.log("Blog entry and image deletion process complete.");
        res.redirect("/main");

    } catch (err) {
        console.error("Error deleting blog entry:", err);
        res.status(500).send("Error deleting blog entry.");
    }
});

// Route to view a specific blog by its unique ID
app.get("/new-blog/:id", async (req, res) => {
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

app.get("/blog/get-inspired", (req, res) => {
    const blog = defaultBlogs.find(b => b.description.startsWith("It is true"));
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

app.get("/blog/how-to-save-for-a-trip", (req, res) => {
    const blog = defaultBlogs.find(b => b.description.startsWith("The key to any trip"));
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

app.get("/blog/how-to-plan-a-trip", (req, res) => {
    const blog = defaultBlogs.find(b => b.description.startsWith("Planning your trip"));
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

app.get("/blog/finding-accomodation", (req, res) => {
    const blog = defaultBlogs.find(b => b.description.startsWith("Accommodation will"));
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

app.get("/blog/solo-female", (req, res) => {
    const blog = defaultBlogs.find(b => b.description.startsWith("Traveling the world"));
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

app.get("/blog/family-travel", (req, res) => {
    const blog = defaultBlogs.find(b => b.description.startsWith("Family travel"));
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

app.get("/blog/travel-scams-to-avoid", (req, res) => {
    const blog = defaultBlogs.find(b => b.description.startsWith("Travel scams are real"));
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

app.get("/about", (req, res) => {
    res.render("about.ejs", {
        thisYear: theDate,
    });
});

app.get("/", (req, res) => {
    res.sendFile("index.html", { root: "public" });
});

app.listen(port, async () => {
    console.log(`Running the server on port: ${port}`);
});