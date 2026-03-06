const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    points: {
        guessingGame: {
            type: Number,
            default: 0
        },
        ticTacToe: {
            type: Number,
            default: 0
        },
        simonGame: {
            type: Number,
            default: 0
        },
        rockPaperScissors: {
            type: Number,
            default: 0
        }
    }
}, { timestamps: true });

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);