import express from "express";
import bodyParser from "body-parser";
import multer from "multer";

const app= express();
const port= process.env.PORT || 3000;
const storage = multer.diskStorage({
    destination : function (req, file, cb){
        return cb(null, "./public/images/uploads");
    },

    //? What should be the name of the file
        filename : function (req, file, cb){
            return cb(null, `${Date.now()}-${file.originalname}`);
        },
});

const upload = multer({ storage });
var theDate= new Date().getFullYear();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.urlencoded({extended : false}));

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
                thisYear : theDate,
            }
        )
    }
    
    else{
        res.render("auth.ejs",{
            thisYear : theDate,
        });
    }
})


app.post("/upload", upload.single("highlight"), (req, res) =>
{   
    return res.redirect("/admin");
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