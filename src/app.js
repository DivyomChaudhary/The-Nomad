import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import blogRoutes from "./routes/blogRoutes.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

// Connect to Atlas
mongoose.connect('mongodb+srv://myAtlasDBUser:XncW5CZ6Bx4aEWFy@myatlasclusteredu.capf7ft.mongodb.net/blogDB?retryWrites=true&w=majority&appName=myAtlasClusterEDU')
.then(() => {
    console.log("Successfully connected to MongoDB Atlas!");
})
.catch((err) => {
    console.error("Error connecting to MongoDB Atlas:", err);
});

app.use("/", blogRoutes);

// Export the app to be used by server.js
export default app;