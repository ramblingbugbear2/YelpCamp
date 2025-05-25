const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');
const { storeReturnTo } = require('../middleware'); // Middleware to store intended redirect URL

const users = require('../controllers/users')

// ────────────── Registration Routes ──────────────

// Show the registration form
router.get('/register', users.renderRegister);

// Handle registration logic
router.post('/register', users.register);

// ────────────── Login Routes ──────────────

// Show the login form
router.get('/login', users.renderLogin);

// Handle login logic
// 1. storeReturnTo middleware saves where user was going
// 2. passport.authenticate checks credentials, flashes error if fail
// 3. If login succeeds, flash success and redirect to intended URL or campgrounds index
router.post('/login', storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login );

// ────────────── Logout Route ──────────────

// Log out user, flash message, and redirect to campgrounds index
router.get('/logout', users.logout);

module.exports = router;
