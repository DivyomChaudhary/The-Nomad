import express from "express";
import bodyParser from "body-parser";

const app= express();
const port= 3000;
var theDate= new Date().getFullYear();

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

app.get("/", (req, res) =>
{
    res.render("index.ejs", {
        thisYear : theDate,
    });
})

app.get("/admin", (req, res)=>
{
    res.render("addblog.ejs",
        {
            thisYear : theDate,
        }
    );
})

app.listen(port, ()=>
{
    console.log(`Running the server on port: ${port}`);
    
})