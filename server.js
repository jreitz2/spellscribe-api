require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('./models/user');
const usersController = require('./controllers/usersController');

//create express app
const app = express();

//middleware
app.set("trust proxy", 1);
app.use(cors({
  origin: 'https://jreitz2.github.io',
  credentials: true,
}));
app.use(express.json());
app.use(session({ 
  secret: "cats",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    httpOnly: true,
    domain: "https://spellscribe-api.onrender.com",
  },
 }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));


passport.use(
    new LocalStrategy(async (username, password, done) => {
        try {
          const user = await User.findOne({ username: username });
          if (!user) {
            return done(null, false, { message: "Incorrect username" });
          }
    
          bcrypt.compare(password, user.password, (err, res) => {
            if (err) {
              return done(err); // Handle the bcrypt error here
            }
            if (res) {
              // passwords match! log user in
              return done(null, user);
            } else {
              // passwords do not match!
              return done(null, false, { message: "Incorrect password" });
            }
          });
        } catch (err) {
          return done(err);
        }
      })
);

passport.serializeUser(function(user, done) {
    done(null, user.id);
});
  
passport.deserializeUser(async function(id, done) {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch(err) {
      done(err);
    };
});


//connect to DB
const connectToDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URL, {useNewUrlParser: true, useUnifiedTopology: true});
        console.log('connected to DB');
    } catch (err) {
        console.log(err);
    }
}
connectToDB();

//routing
app.post('/signup', usersController.signup);
app.post('/login', usersController.login);
app.post('/logout', usersController.logout);
app.get('/check-login', (req, res) => {
  if (req.isAuthenticated()) {
    console.log("Authenticated?", req.isAuthenticated());
    res.status(200).json({message: 'User is Logged in', loggedIn: true, user: req.user});
  } else {
    console.log("Authenticated?", req.isAuthenticated());
    res.status(401).json({message: 'User is not logged in', loggedIn: false});
  }
})
app.put('/create-character/:userId', usersController.createCharacter);
app.put('/update-user/:userId', usersController.updateUser);

//start server
app.listen(process.env.PORT);