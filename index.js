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
    res.render("auth.ejs",
        {
            thisYear : theDate,
        }
    );
})

const trueUser = "D.C.";
const truePwd = "Divss2618divyom";

app.post("/submit", (req, res) =>
{
    var user = req.body["username"];
    var pwd = req.body["password"];
    if (user === trueUser && pwd ===truePwd)
    {
        res.render("new-blog.ejs",
            {
                adminName : user,
            }
        )
    }
    
    else{
        res.render("auth.ejs");
    }
})

app.get("/about", (req, res)=>
{
    res.render("about.ejs", {
        thisYear : theDate,
    });
})

app.listen(port, ()=>
{
    console.log(`Running the server on port: ${port}`);
    
})