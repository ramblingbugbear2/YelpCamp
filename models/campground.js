const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review')

// https://res.cloudinary.com/dewvrns36/image/upload/w_300/v1747934975/YelpCamp/ehy7rh3e0v4vljmgxeov.jpg

const ImageSchema = new Schema({
    url:String,
    filename:String
})
ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload','/upload/w_200')
})

const opts = { toJSON: { virtuals:true }}

const CampgroundsSchema = new Schema({
    title: String,
    images: [ ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

CampgroundsSchema.virtual('properties.popUpMarkup').get(function(){
    return `<a href="/campgrounds/${this._id}">${this.title}</a>`
})

CampgroundsSchema.post('findOneAndDelete', async function(doc) {
    // console.log("middleware working the review is deleted!")
    if(doc) {
        await Review.deleteMany({
            _id: {
                $in:doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundsSchema);