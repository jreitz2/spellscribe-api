const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true,
    },
    password: {
        type: String,
        required: true,
    },
    characters: [
        {
            characterName: {
                type: String,
                required: true,
            },
            characterClass: {
                type: String,
            },
            spells: [Object]
        }
    ]
});

const User = mongoose.model("User", userSchema);

module.exports = User;