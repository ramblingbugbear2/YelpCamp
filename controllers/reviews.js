const Campground = require('../models/campground');     // Mongoose Campground model
const Review = require('../models/review');             // Mongoose Review model

// CREATE REVIEW - Add a new review to a campground
module.exports.createReview = async (req, res) => {
  // Find the campground by ID (from route params)
  const campground = await Campground.findById(req.params.id);

  // Create a new Review from form data
  const review = new Review(req.body.review);

  // Associate the review with the current user
  review.author = req.user._id;

  // Push the review's ID into the campground's reviews array
  campground.reviews.push(review._id);

  // Save both review and campground to the database
  await review.save();
  await campground.save();

  req.flash('success', 'Created new review!!');
  res.redirect(`/campgrounds/${campground._id}`);
}

// DELETE REVIEW - Remove a review from a campground
module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;  // id = campground, reviewId = review

  // Remove review reference from the campground's reviews array
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

  // Delete the review from the database
  await Review.findByIdAndDelete(reviewId);

  req.flash('success', 'Deleted review!!');
  res.redirect(`/campgrounds/${id}`);
}