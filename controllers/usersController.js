const bcrypt = require('bcryptjs');
const User = require('../models/user');
const passport = require('passport');

//signup
const signup = async (req, res, next) => {
    try {
        const plaintextPassword = req.body.password;
        const hashedPassword = await new Promise((resolve, reject) => {
            bcrypt.hash(plaintextPassword, 10, (err, hash) => {
              if (err) reject(err);
              resolve(hash);
            });
          });

      const user = new User({
        username: req.body.username,
        password: hashedPassword,
      });
      const result = await user.save();
      res.status(200).json({message: 'user created'});
    } catch(err) {
      return next(err);
    };
}

const login = async (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    console.log('Authentication Attempt:', err, user, info);
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    req.login(user, (err) => {
      if (err) {
        return next(err);
      }

      // At this point, the user is logged in
      return res.status(200).json({ message: 'Logged in', user: user });
    });
  })(req, res, next); // Call the passport.authenticate function
}

const logout = async (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.status(200).json({ message: 'Logged out' });
  })
}

const createCharacter = async (req, res) => {
  try {
    const { userId } = req.params;
    const { characterName, characterClass } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'user not found' });
    }
    user.characters.push({ characterName, characterClass });
    await user.save();
    res.status(200).json({ message: 'character created', characterName})
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'server error'});
  }
}

const updateUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const updatedUserData = req.body;
    const user = await User.findOneAndUpdate(
      { _id: userId },
      { $set: updatedUserData },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'user not found' });
    }
    res.status(200).json({ message: 'user updated', user});
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'server error'});
  }
}

module.exports = { signup, login, logout, createCharacter, updateUser };