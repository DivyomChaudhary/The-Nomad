import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";

const port = process.env.PORT || 3000;

app.listen(port, async () => {
    console.log(`Running the server on port: ${port}`);
});