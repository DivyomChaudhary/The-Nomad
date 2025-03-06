import express from "express";
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

var newBlog= [];


var theDate= new Date().getFullYear();

app.use(express.urlencoded({extended : true}));
app.use(express.static("public"));

app.get("/", (req, res) =>
{
    res.sendFile("/index.html");
})

app.get("/main", (req, res) =>
{   
    console.log(newBlog);
    res.render("index.ejs", {
        thisYear : theDate,
        newBlog : newBlog,
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
const truePwd = "test";

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
            error: true, //for adding error modal
        });
    }
})

app.post("/upload", upload.single("highlight"), (req, res) =>
{   
    console.log(req.body);
    console.log(req.file)
    
    const { titleName, authorName, description } = req.body;
    const image = req.file ? `/images/uploads/${req.file.filename}` : null;

    const newBlogEntry = {
        title: titleName,
        author: authorName,
        description: description,
        image: image,
    };

    newBlog.push(newBlogEntry);
    return res.redirect("/main");
})

app.post("/remove", (req, res) => {
    const index = parseInt(req.body.index);
    if (!isNaN(index) && index >= 0 && index < newBlog.length) {
        newBlog.splice(index, 1);
    }
    res.redirect("/");
});

app.get("/new-blog/:index", (req, res) => {
    const index = parseInt(req.params.index);
    if (!isNaN(index) && index >= 0 && index < newBlog.length) {
        const blog = newBlog[index];
        res.render("index-blog.ejs", {
            titleName: blog.title,
            authorName: blog.author,
            image: blog.image,
            description: blog.description,
            thisYear : theDate,
        });
    } else {
        if (isNaN(index) || index < 0) {
            res.status(400).send("Invalid blog index");
        } else if (newBlog.length === 0) {
            res.status(404).send("No blogs found");
        } else {
            res.status(404).send("Blog not found");
        }
    }
});

app.get("/blog/get-inspired", (req, res) =>
{
        res.render("index-blog.ejs", {
            titleName : "Get Inspired",
            authorName : "John Doe",
            description : blogs[0].description,
            image: blogs[0].image,
            thisYear : theDate,
        })
    
}
)

app.get("/blog/how-to-save-for-a-trip", (req, res) =>
{
        res.render("index-blog.ejs", {
            titleName : "How to Save for a Trip",
            authorName : "John Doe",
            description : blogs[1].description,
            image: blogs[1].image,
            thisYear : theDate,
        })
    
}
)

app.get("/blog/how-to-plan-a-trip", (req, res) =>
{
        res.render("index-blog.ejs", {
            titleName : "How to Plan a Trip",
            authorName : "John Doe",
            description : blogs[2].description,
            image: blogs[2].image,
            thisYear : theDate,
        })
    
}
)

app.get("/blog/finding-accomodation", (req, res) =>
{
        res.render("index-blog.ejs", {
            titleName : "Finding Accomodation",
            authorName : "John Doe",
            description : blogs[3].description,
            image: blogs[3].image,
            thisYear : theDate,
        })
    
}
)

app.get("/blog/solo-female", (req, res) =>
{
        res.render("index-blog.ejs", {
            titleName : "Solo Female Travel",
            authorName : "John Doe",
            description : blogs[4].description,
            image: blogs[4].image,
            thisYear : theDate,
        })
    
}
)

app.get("/blog/family-travel", (req, res) =>
{
        res.render("index-blog.ejs", {
            titleName : "Family Travel",
            authorName : "John Doe",
            description : blogs[5].description,
            image: blogs[5].image,
            thisYear : theDate,
        })
    
}
)

app.get("/blog/travel-scams-to-avoid", (req, res) =>
{
        res.render("index-blog.ejs", {
            titleName : "5 Travel Scams to Avoid",
            authorName : "John Doe",
            description : blogs[6].description,
            image: blogs[6].image,
            thisYear : theDate,
        })
    
}
)


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



var blogs = [
    { image: '/images/Blogs/get-inspired.jpg',
        description : `It is true that optimists, or positive thinkers, are at an advantage in life compared to pessimists. This is because of the effect your mindset and attitude have on everything we come across. Our social relationships, our job and also our health are an integral part of our daily life and we can feel how negative and positive thoughts can have a domino effect on everything we do during the day.<br> <br>The way we choose to think, positive or negative, has a great impact on the final outcome and is mirrored in everything we do. Hence the importance of having a balanced outlook on life. Positive thinking is power for your soul.<br> <br>Whether you are an optimist or a pessimist, these inspiring blogs - awarded by Market Inspector - will take you into a vortex of happiness, positivity, balance, mindfulness and peace. Our awarded bloggers have changed the life of thousands of readers, get the chance to make yours better today!`,
    },
    { image: '/images/Blogs/how-to-save-for-a-trip.jpg',
        description : "The key to any trip is being smart with your money – and that starts even before you hit the road! It’s important to know how to save and plan your trip so you don’t find yourself running out of money on the road. Here are my best tips and tricks on how to save money for any trip (even if you don’t make a ton of money). You’ll find a plethora of resources, interviews with other travelers, and secret ninja travel hacks that will jump-start your travel fund!<br> <br> <h3><center>MY FAVORITE TRAVEL RESOURCES</center></h3><br><p>Below are my favorite companies to use when I travel. They are always my starting point when I need to book a flight, accommodation, tour, or vehicle!</p><br><ul><li>Skyscanner – Skyscanner is my favorite flight search engine. It searches small websites and budget airlines that larger search sites tend to miss. It is hands-down the number one place to start.</li><br><li>Going.com – Going (formerly Scott’s Cheap Flights) finds incredible flight deals and sends them directly to your inbox. If you’re flexible with your dates and destinations, you can score some amazing deals and save hundreds of dollars in the process!</li><br><li>Hostelworld – This is the best hostel accommodation site out there, with the largest inventory, best search interface, and widest availability.</li><br><li>Booking.com – The best all-around booking site. It constantly provides the cheapest and lowest rates and has the widest selection of budget accommodation. In all my tests, it’s always had the cheapest rates out of all the booking websites.</li><br><li>Take Walks – Walks offers in-depth history, food, and cultural tours in cities around the world. Its small-group tours offer exclusive behind-the-scenes access other companies can’t get and use really incredible and knowledgeable guides. I can’t recommend them enough.</li><br></ul>"
    },
    { image: '/images/Blogs/how-to-plan-a-trip.jpg',
        description : "Planning your trip can be a lot of work! Where do you start? What’s step one? What’s step two? What’s step three? Fret not! This page will give you all the best resources I have for planning your trip from start to finish. These posts go into the nuts and bolts of planning. They will teach you what to do first, second, and third. They will teach you how to narrow down your travel choices, know where to get legit information on the web (besides here), and help you avoid the newbie mistakes I made in the beginning!<br> <br> <h3><center>MY FAVORITE TRAVEL RESOURCES</center></h3><br><p>Below are my favorite companies to use when I travel. They are always my starting point when I need to book a flight, accommodation, tour, or vehicle!</p><br><ul><li>Skyscanner – Skyscanner is my favorite flight search engine. It searches small websites and budget airlines that larger search sites tend to miss. It is hands-down the number one place to start.</li><br><li>Going.com – Going (formerly Scott’s Cheap Flights) finds incredible flight deals and sends them directly to your inbox. If you’re flexible with your dates and destinations, you can score some amazing deals and save hundreds of dollars in the process!</li><br><li>Hostelworld – This is the best hostel accommodation site out there, with the largest inventory, best search interface, and widest availability.</li><br><li>Booking.com – The best all-around booking site. It constantly provides the cheapest and lowest rates and has the widest selection of budget accommodation. In all my tests, it’s always had the cheapest rates out of all the booking websites.</li><br><li>Take Walks – Walks offers in-depth history, food, and cultural tours in cities around the world. Its small-group tours offer exclusive behind-the-scenes access other companies can’t get and use really incredible and knowledgeable guides. I can’t recommend them enough.</li><br></ul>"
    },
    { image: '/images/Blogs/finding-accomodation.jpg',
        description : "Accommodation will be one of your biggest daily expenses – and lowering that cost can lead to huge savings. To a lot of people, the choice seems to be either expensive hotels or cheap hostel dorms. But there are many other options available to travelers – whether you are a solo traveler, a couple, or a family. These articles will help choose the right accommodation for yourself, find the best deals, avoid being scammed, and break out of the hotel/hostel dynamic.<br> <br> <h3><center>MY FAVORITE TRAVEL RESOURCES</center></h3><br><p>Below are my favorite companies to use when I travel. They are always my starting point when I need to book a flight, accommodation, tour, or vehicle!</p><br><ul><li>Skyscanner – Skyscanner is my favorite flight search engine. It searches small websites and budget airlines that larger search sites tend to miss. It is hands-down the number one place to start.</li><br><li>Going.com – Going (formerly Scott’s Cheap Flights) finds incredible flight deals and sends them directly to your inbox. If you’re flexible with your dates and destinations, you can score some amazing deals and save hundreds of dollars in the process!</li><br><li>Hostelworld – This is the best hostel accommodation site out there, with the largest inventory, best search interface, and widest availability.</li><br><li>Booking.com – The best all-around booking site. It constantly provides the cheapest and lowest rates and has the widest selection of budget accommodation. In all my tests, it’s always had the cheapest rates out of all the booking websites.</li><br><li>Take Walks – Walks offers in-depth history, food, and cultural tours in cities around the world. Its small-group tours offer exclusive behind-the-scenes access other companies can’t get and use really incredible and knowledgeable guides. I can’t recommend them enough.</li><br></ul>"
    },
    { image: '/images/Blogs/solo-female.jpg',
        description : "Traveling the world as a solo female? Worried something might happen? Nervous? Think your friends and family might be right about the world “being dangerous”? Not sure where to begin? Fear not. Many women travel the world alone and thrive. It’s very common now (just look at all the people showcasing their travels on Instagram!).<br> <br>Since I can’t offer advice on this subject (I’m a guy!), I brought a variety of solo female travel writers to share their tips, tricks, and advice on how to stay safe and crush it on the road.<br> <br> <h3><center>MY FAVORITE TRAVEL RESOURCES</center></h3><br><p>Below are my favorite companies to use when I travel. They are always my starting point when I need to book a flight, accommodation, tour, or vehicle!</p><br><ul><li>Skyscanner – Skyscanner is my favorite flight search engine. It searches small websites and budget airlines that larger search sites tend to miss. It is hands-down the number one place to start.</li><br><li>Going.com – Going (formerly Scott’s Cheap Flights) finds incredible flight deals and sends them directly to your inbox. If you’re flexible with your dates and destinations, you can score some amazing deals and save hundreds of dollars in the process!</li><br><li>Hostelworld – This is the best hostel accommodation site out there, with the largest inventory, best search interface, and widest availability.</li><br><li>Booking.com – The best all-around booking site. It constantly provides the cheapest and lowest rates and has the widest selection of budget accommodation. In all my tests, it’s always had the cheapest rates out of all the booking websites.</li><br><li>Take Walks – Walks offers in-depth history, food, and cultural tours in cities around the world. Its small-group tours offer exclusive behind-the-scenes access other companies can’t get and use really incredible and knowledgeable guides. I can’t recommend them enough.</li><br></ul>"
    },
    { image: '/images/Blogs/family-travel.jpg',
        description : "Family travel requires more planning (and more money) than solo travel – but that hardly makes it impossible (even if you have lots of kids). Many families travel long-term – and well – on very little money. “Senior” travel also presents a unique set of challenges – from comfort to health issues. As a single 40-year-old, there’s a lot about these two aspects of travel I don’t know. While I don’t believe these two types of travels are fundamentally different than what I do, there’s planning involved I can’t help with. So I brought in experts!<br><br>In this section, you’ll find numerous interviews and guest posts that illustrate a) we are never too old to explore, learn, and travel and b) that you can take your family on that dream vacation or round-the-world adventure without breaking the bank!<br> <br> <h3><center>MY FAVORITE TRAVEL RESOURCES</center></h3><br><p>Below are my favorite companies to use when I travel. They are always my starting point when I need to book a flight, accommodation, tour, or vehicle!</p><br><ul><li>Skyscanner – Skyscanner is my favorite flight search engine. It searches small websites and budget airlines that larger search sites tend to miss. It is hands-down the number one place to start.</li><br><li>Going.com – Going (formerly Scott’s Cheap Flights) finds incredible flight deals and sends them directly to your inbox. If you’re flexible with your dates and destinations, you can score some amazing deals and save hundreds of dollars in the process!</li><br><li>Hostelworld – This is the best hostel accommodation site out there, with the largest inventory, best search interface, and widest availability.</li><br><li>Booking.com – The best all-around booking site. It constantly provides the cheapest and lowest rates and has the widest selection of budget accommodation. In all my tests, it’s always had the cheapest rates out of all the booking websites.</li><br><li>Take Walks – Walks offers in-depth history, food, and cultural tours in cities around the world. Its small-group tours offer exclusive behind-the-scenes access other companies can’t get and use really incredible and knowledgeable guides. I can’t recommend them enough.</li><br></ul>"
    },
    {
        image: '/images/Blogs/travel-scams.jpg',
        description : 'Travel scams are real — and they vary from country to country. If you are carrying a travel guidebook, it will list the most common scams in that specific country.<br> <br> To help you stay safe, today, I want to give you a list of common travel scams to avoid.<br> <br>Avoiding travel scams requires a lot of common sense and a healthy dose of suspicion. If it seems too good to be true, it probably is!<br> <br> <h3>1. The taxi overcharge</h3><br> <br>This is one of the most common travel scams out there. Either the driver will tell you the meter is broken and try to charge you a huge rate or you’ll see the meter go higher and faster than usual. <br> <br>To avoid this scam, first, you need to know how much a ride should cost. I always ask the hostel or hotel staff what a ride should be so I have a frame of reference. <br> <br>Next, if the cabbie tries to negotiate the rate with me, I offer him the correct rate. If he refuses, I find someone who will put the meter on. If the meter seems to be going up too quickly, I have them pull over and I get out. Many tourism boards let you report bad cab drivers so be sure to always make a mental note of their ID number when you get in the cab. <br> <br>When in doubt, ask your hostel/hotel staff to call a cab for you. They will know which companies are reputable.<br> <br>And never get in an unlicensed cab — no matter how amazing the deal is!<br><br> <h3>2. Your accommodation is “closed”</h3><br> <br>This is another cab-driver-related scam. In this scam, your driver will tell you your hotel or hostel is overbooked or even closed. It’s not. I mean, you wouldn’t have booked it if it was, right? Just ignore them and insist on going there. If they keep trying, continue to insist. They will usually shut up about it.<br><br>And while this seems like a scam no one could possibly fall for, people do. I’ve been in many cabs where they insist my hostel has been closed for months.<br><br><h3>3. The shell game</h3><br><br>I see this one all the time — how people fall for it I’ll never know. It’s such an old and obvious scam. It’s in movies, for heaven’s sake! You’ll see people on the street playing a card game (sometimes known as three-card Monte) or hiding a ball in a cup and someone guessing where it is and winning money. <br><br><h3>4. The spill on your clothes</h3><br><br><h3>5. The flirtatious local</h3>'
    }
];