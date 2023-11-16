mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    isVerified: Boolean,
    // otp: {
    //     type: String,
    //     required: true, // Make OTP a required field
    //   },
      otpTimestamp: {
        type: Date,
      },
});

module.exports= mongoose.model('USer', userSchema)