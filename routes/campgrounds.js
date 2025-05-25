// ──────────────── 1️⃣ Module Imports ────────────────

const express = require('express');
const router = express.Router();

const campgrounds = require('../controllers/campgrounds')
const catchAsync = require('../utlis/catchAsync'); // Helper to catch async errors
const Campground = require('../models/campground'); // Mongoose model

const { storage } =require('../cloudinary')

const multer = require('multer');
const upload = multer({ storage })

// Import middleware for auth, ownership, and data validation
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware.js');

// ──────────────── 2️⃣ RESTful Campground Routes ────────────────

// INDEX - List all campgrounds
router.get('/', catchAsync(campgrounds.index));

// NEW - Show form to create a new campground (must be logged in)
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

// CREATE - Handle form submission to add new campground
router.post('/', isLoggedIn,  upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))
// router.post('/', upload.single('image'), (req,res) => {
//     console.log(req.body, req.file)
//     res.send('IT WORKED!')
// })

// SHOW - Display details for a single campground (populate reviews and author)
router.get('/:id', catchAsync(campgrounds.showCampground))

// EDIT - Show form to edit campground (must be logged in & be the author)
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

// UPDATE - Handle form submission to update campground (auth, ownership, validation required)
router.put('/:id', isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))

// DELETE - Remove a campground (must be logged in & be the author)
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

module.exports = router;