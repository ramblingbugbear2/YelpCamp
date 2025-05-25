// ──────────────── 1️⃣ Module Imports ────────────────
const express = require('express');
const router = express.Router({ mergeParams: true });   // Merge :id from parent route
const catchAsync = require('../utlis/catchAsync');      // Wrapper for async errors
const ExpressError = require('../utlis/ExpressError');  // Custom error class
const { reviewSchema } = require('../schemas.js');      // Joi validation schema
const Campground = require('../models/campground');     // Mongoose Campground model
const Review = require('../models/review');             // Mongoose Review model
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware.js')

const reviews = require('../controllers/reviews')

// ──────────────── 3️⃣ Review Routes (nested under campgrounds/:id/reviews) ────────────────

// CREATE - Add a new review to a campground
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

// DELETE - Remove a review from a campground and DB
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;