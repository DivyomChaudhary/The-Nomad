import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import app from "./src/app.js";

const port = process.env.PORT || 3000;

// Connect to Atlas
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log("Successfully connected to MongoDB Atlas!");
    // Start the server only after a successful database connection
    app.listen(port, async () => {
        console.log(`Running the server on port: ${port}`);
    });
})
.catch((err) => {
    console.error("Error connecting to MongoDB Atlas:", err);
});