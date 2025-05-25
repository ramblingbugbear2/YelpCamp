const User = require('../models/user');
const passport = require('passport');

// Render the registration form
module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

// Handle user registration
module.exports.register = async (req, res, next) => {
    try {
        // Get form fields
        const { email, username, password } = req.body;
        const user = new User({ email, username });

        // Register user with hashed password (passport-local-mongoose)
        const registeredUser = await User.register(user, password);

        // Log the user in automatically after registration
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        });
    } catch (e) {
        // Handle duplicate user/validation errors
        req.flash('error', e.message);
        res.redirect('/register');
    }
}

// Render the login form
module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}

// Handle login and redirect user to intended page or campgrounds index
module.exports.login = (req, res) => {
    req.flash('success', 'Welcome Back!');
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    delete req.session.returnTo; // Remove returnTo from session after use
    res.redirect(redirectUrl);
}

// Handle logout and redirect to campgrounds index
module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'You have been logged out');
        res.redirect('/campgrounds');
    });
}