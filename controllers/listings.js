const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError.js");


module.exports.index = async(req,res)=> {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
};

module.exports.renderNewForm = (req,res)=> {
    res.render("listings/new.ejs");
};

module.exports.showListing = async(req,res)=> {
    let {id} = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path:"reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner");
    if(!listing){
        req.flash("error","Listing you requested for is does not exist");
        res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", {listing});
};

module.exports.createListing = async (req, res, next) => {
    try {
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;

        if (req.file) {
            const { path: url, filename } = req.file;
            newListing.image = { url, filename };
        } else {
            newListing.image = {
                url: "https://source.unsplash.com/400x300/?nature,travel",
                filename: "default-image"
            };
        }

        await newListing.save();
        req.flash("success", "New Listing Created!");
        res.redirect("/listings");
    } catch (err) {
        next(err);
    }
};


module.exports.renderEditForm = async(req, res)=> {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for is does not exist");
        res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs", {listing, originalImageUrl});
};

module.exports.updateListing = async (req, res, next) => {
    try {
        let { id } = req.params;
        let listing = await Listing.findById(id);
        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }

        Object.assign(listing, req.body.listing);

        if (req.file) {
            const { path: url, filename } = req.file;
            listing.image = { url, filename };
        }

        await listing.save();
        req.flash("success", "Listing Updated!");
        res.redirect(`/listings/${id}`);
    } catch (err) {
        next(err);
    }
};


module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log("Deleted listing:", deletedListing);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
}