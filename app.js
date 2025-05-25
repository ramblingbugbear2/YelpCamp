// ──────────────── 1️⃣ Module Imports & Models ────────────────

if(process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}


const express = require('express');            // Web framework
const path = require('path');                  // File/path utilities
const mongoose = require('mongoose');          // MongoDB ODM
const ejsMate = require('ejs-mate');           // Advanced EJS layouts
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');

const catchAsync = require('./utlis/catchAsync');             // Wrapper for async errors
const ExpressError = require('./utlis/ExpressError');         // Custom error class
const methodOverride = require('method-override');            // Support for PUT/DELETE in forms

const sanitizeV5 = require('./utlis/monoSanitizeV5.js');

// Import routers
const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds.js');
const reviewRoutes = require('./routes/reviews.js');
const monoSanitizeV5 = require('./utlis/monoSanitizeV5.js');


──────────────── 2️⃣ Database Connection ────────────────

<<<<<<< HEAD
mongoose.connect('mongodb+srv://rockstarvivek25:mJDWqv55A4K3Kz2U@cluster0.9yunzym.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
=======
mongoose.connect('mongodb+srv://rockstarvivek25:c63pMJbgSm9AABUo@cluster0.9yunzym.mongodb.net/yelp-camp?retryWrites=true&w=majority&appName=Cluster0')
>>>>>>> 5b381749d5bc98434f30d5ae6a6695a5dbe5ddcf
  .then(() => console.log("✅ Database connected: yelp-camp (Atlas)"))
  .catch(err => console.error("❌ MongoDB Atlas connection error:", err));

//   // local connection
// mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
//   .then(() => console.log("✅ Database connected: yelp-camp"))
//   .catch(err => console.error("❌ MongoDB connection error:", err));

// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "connection error:"));

// ──────────────── 3️⃣ Express App Setup & Middleware ────────────────

const app = express();

app.set('query parser', 'extended');

app.engine('ejs', ejsMate);                         // Enables EJS layouts
app.set('view engine', 'ejs');                      // Set EJS as view engine
app.set('views', path.join(__dirname, 'views'));    // Path to EJS templates

app.use(express.urlencoded({ extended: true }));     // Parse form bodies (req.body)
app.use(methodOverride('_method'));                  // Allow ?_method=PUT/DELETE in forms

// Serve static files (CSS, images, client JS, etc.) from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.use(sanitizeV5({replaceWith: '_'}))


//instead of app.use(helmet()) we have to use below code as helmet is too much strict
const scriptSrcUrls = [
  "https://cdn.jsdelivr.net",            // Bootstrap
  "https://cdn.maptiler.com",            // MapTiler JS
  "https://cdnjs.cloudflare.com",        // Other CDNs
];
const styleSrcUrls = [
  "https://cdn.jsdelivr.net",            // Bootstrap CSS
  "https://cdn.maptiler.com",            // MapTiler CSS
];
const connectSrcUrls = [
  "https://api.maptiler.com",            // MapTiler API
];
const fontSrcUrls = [
  "https://fonts.googleapis.com",         // Google Fonts
  "https://fonts.gstatic.com"
];
const imgSrcUrls = [
  "https://res.cloudinary.com",          // Cloudinary images
  "https://images.unsplash.com",
  "https://cdn.maptiler.com",
  "data:"
];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: ["'self'", "blob:", "data:", ...imgSrcUrls],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);
app.use(helmet({ contentSecurityPolicy: false }));

// ──────────────── 4️⃣ Session, Flash, Passport ────────────────

const sessionConfig = {
  name: 'session',
  secret: 'this is a top secret!',
  resave: false,
  saveUninitialized: true,
  // secure: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000*60*60*24*7,      // 1 week
    maxAge: 1000*60*60*24*7
  }
}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());  // should be after app.use(session())

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ──────────────── 5️⃣ Global Locals & ReturnTo Middleware ────────────────

app.use((req, res, next) => {
  // Uncomment to debug session: console.log(req.session);

  // Store the original URL if not login or home, for redirect after login
  // FIX: Only store if not already logged in and not already on login or home
  if (!['/login', '/'].includes(req.originalUrl) && !req.user) {
    req.session.returnTo = req.originalUrl;
  }
  if (!['/login', '/'].includes(req.originalUrl) && !req.user) {
  req.session.returnTo = req.originalUrl;
}
  // Set user and flash messages available in all templates
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// ──────────────── 6️⃣ Test Route (Remove in Production) ────────────────

app.get('/fakeUser', async (req, res) => {
  const user = new User({ email: 'vivek@gmail.com', username: 'vivek' });
  const newUser = await User.register(user, 'rasmalai');
  res.send(newUser);
});

// ──────────────── 7️⃣ Main Routes ────────────────

// Mount routers for users, campgrounds, and reviews
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

// ──────────────── 8️⃣ Home Route ────────────────

app.get('/', (req, res) => {
  res.render('home');
});

// ──────────────── 9️⃣ Error Handling ────────────────

// Catch-all route for unmatched URLs (404)
app.all(/(.*)/, (req, res, next) => {
  next(new ExpressError('Page Not Found', 404));
});

// Central error handler for all errors
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "hmmm something is wrong....";
  res.status(statusCode).render('error', { err });
});

// ──────────────── 🔟 Server Launch ────────────────

app.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
});
