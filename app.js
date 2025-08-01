const express = require ("express");
const app= express();
const mongoose = require("mongoose");
const Listing = require('./models/listing');
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require('./utils/ExpressError.js');
const {listingSchema} = require("./schema.js")


const sampleListings = require("./init/data.js");


main()
.then(async () => {
    console.log("MongoDB connection successful");

    const count = await Listing.countDocuments({});
    if (count === 0) {
        await Listing.insertMany(sampleListings);
        console.log("Sample data seeded into DB");
    } else {
        console.log("Listings already exist. No seeding needed.");
    }
})
.catch(err => console.log("MongoDB connection error:", err));

main()
.then(()=> {
    console.log("connection successful");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

// app.get("/testListing", async (req,res)=> {
//     let sampleListing = new Listing({
//         title: "my new villa",
//         description: " by the beach",
//         price:1200,
//         location:"calangute, Goa",
//         country:"India",
//     });

//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine("ejs", ejsMate); // if using ejs-mate
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"))
app.use(express.static(path.join(__dirname,("/public"))));

app.get("/", (req,res)=> {
    res.send("hii, i am root");
});

const validateListing = ((req,res,next)=> {
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
})

//index
app.get ("/listings",wrapAsync(async(req,res)=> {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
}));

//new
app.get("/listings/new",(req,res)=> {
    res.render("listings/new.ejs");
});

//edit
app.get(
    "/listings/:id/edit",wrapAsync(async(req, res)=> {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}));

//show
app.get("/listings/:id",wrapAsync(async(req,res)=> {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", {listing});
}));

//create
app.post(
    "/listings", 
    validateListing,
    wrapAsync(async (req, res, next) => {
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");
    })
);

//update
app.put("/listings/:id",validateListing,wrapAsync(async(req, res)=> {
    if(!req.body.listing) {
        throw new ExpressError(404,"send valid data for listing");
    }
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
}));

//delete
app.delete("/listings/:id",wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log("Deleted listing:", deletedListing);
    res.redirect("/listings");
}));

app.all("*",(req, res, next)=> {
    next(new ExpressError(404,"page not found!"));
});

app.use((err, req, res, next)=> {
    let {statusCode=500,message="something went wrong!"} = err;
    res.status(statusCode).render("error.ejs", {message});
    // res.status(statusCode).send(message);
});

app.listen(8080, ()=> {
    console.log("app is listning on port 8080");
});
