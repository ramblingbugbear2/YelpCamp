// ──────────────── 1️⃣ Imports ────────────────

// Joi schemas for validation
const { campgroundSchema, reviewSchema } = require('./schemas.js');

// Custom error class for consistent error handling
const ExpressError = require('./utlis/ExpressError');

// Campground model (used in isAuthor)
const Campground = require('./models/campground');

const Review = require('./models/review')

// ──────────────── 2️⃣ Middleware ────────────────

// Auth check: Blocks route unless user is logged in
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        // Optional: Save original URL for post-login redirect
        req.session.returnTo = req.originalUrl;

        req.flash('error', 'You must be signed in for adding new campgrounds');
        return res.redirect('/login');
    }
    next();
};

// Store the returnTo URL from session to res.locals (for redirects after login)
module.exports.storeReturnTo = (req, res, next) => {
    if (!req.session.returnTo) {  // <-- FIX: Only set if it exists!
        res.locals.returnTo = req.session.returnTo;
    }
    next();
};

// Validate campground data with Joi before creating/updating
module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400); // triggers Express error handler
    } else {
        next();
    }
};

// Authorization: Only allow the campground's author to edit/delete
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permissions!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};

// Validate review data with Joi before creating
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permissions!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};