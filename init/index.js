const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require('../models/listing');


main()
.then(()=> {
    console.log("connection successful");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

const initDB = async () => {
  try {
    await Listing.deleteMany({});
    const dataWithOwner = initData.map((obj) => ({
      ...obj,
      owner: "6896265b00ce1b4e285eb3a4",
    }));
    await Listing.insertMany(dataWithOwner);
    console.log("data was initialized");
  } catch (err) {
    console.error("Error initializing DB:", err);
  }
};

initDB();