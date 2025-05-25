const campground = require('../models/campground');
const Campground = require('../models/campground'); // Mongoose model
const { cloudniary, cloudinary } = require("../cloudinary")

const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

// INDEX - List all campgrounds
module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', { campgrounds });
}

// NEW - Show form to create a new campground
module.exports.renderNewForm = (req, res) => {         // FIXED typo here
  res.render('campgrounds/new');
}

// CREATE - Add new campground to the database
module.exports.createCampground = async (req, res, next) => {
  const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
  const campground = new Campground(req.body.campground);
  campground.geometry = geoData.features[0].geometry;
  // const campground = new Campground(req.body.campground);
  campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
  campground.author = req.user._id; // Set current user as author
  await campground.save();
  req.flash('success', 'Successfully made a new campground!');
  res.redirect(`/campgrounds/${campground._id}`);
}

// SHOW - Show details for one campground (populates reviews & author)
module.exports.showCampground = async (req, res) => {
  const campground = await Campground.findById(req.params.id)
    .populate({
      path: 'reviews',
      populate: {
        path: 'author'
      }
    })
    .populate('author');
  console.log(campground);
  if (!campground) {
    req.flash('error', 'Campground not found!');
    return res.redirect('/campgrounds');
  }
  res.render('campgrounds/show', { campground });
}

// EDIT - Show edit form for a campground
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash('error', 'Campground not found!');
    return res.redirect('/campgrounds');
  }
  res.render('campgrounds/edit', { campground });
}

// UPDATE - Save edits to a campground
module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  // console.log(req.body)
  const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
  const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
  campground.geometry = geoData.features[0].geometry;
  const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
  campground.images.push(...imgs);
  await campground.save();
  if(req.body.deleteImages){
    for(let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({$pull: { images: {filename: {$in: req.body.deleteImages}}}})
    console.log(campground)
  }
  req.flash('success', 'Successfully updated campground!');
  res.redirect(`/campgrounds/${campground._id}`);
}

// DELETE - Remove a campground and redirect to index
module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash('success', 'Successfully Deleted the campground!');
  res.redirect('/campgrounds');
}
