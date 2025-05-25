const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const {places, descriptors} = require('./seedhelpers')

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {
    //these are not needed as in newer mongo these are default and useCreateIndex is not supported now this was creating an error
    // useNewUrlParser : true,
    // useCreateIndex: true,
    // useUnifiedTopology: true
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", ()=> {
    console.log("DATABASE CONNECTED...");
});
//above copied from app.js

const sample = array => array[Math.floor(Math.random()*array.length)];

const seedDB = async() => {
    await Campground.deleteMany({});
    for (let i = 0; i < 200; i++){
        const random1000 = Math.floor(Math.random()*100);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground ({
            author: '682dbdb77e7d08a3eb25dce6',
            location: `${cities[random1000].City},${cities[random1000].State}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            // image: `https://picsum.photos/400?random=${Math.random()}`,
            images: [
                {
                url: 'https://res.cloudinary.com/dewvrns36/image/upload/v1747913679/YelpCamp/m2g12ogm6gto6llhzsjk.jpg',
                filename: 'YelpCamp/m2g12ogm6gto6llhzsjk',
                },
                {
                url: 'https://res.cloudinary.com/dewvrns36/image/upload/v1747913681/YelpCamp/ty8ygrxdvrt7298aj2e1.jpg',
                filename: 'YelpCamp/ty8ygrxdvrt7298aj2e1',
                }],
            description: 'hi there this is a sample description',
            price,
            geometry: {
                type: "Point",
                coordinates : [cities[random1000].Longitude, cities[random1000].Latitude]
            }
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})