// In your controllers/authController.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator'); // Import the otp-generator library
const User = require('../models/User');
const config = require('../config');

// Function to generate a six-digit OTP
// function generateOTP() {
//   return otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });
// }

// Function to generate a six-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// User registration
async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error:  'User already exists' });
    }
    // Generate an OTP
    const otp = generateOTP();
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with the OTP
    const user = new User({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      otp,
      otpTimestamp: Date.now(),
    });

    // Save the user to the database
    await user.save();

    // Send the OTP to the user via email (you can modify this part as needed)
    const transporter = nodemailer.createTransport({
      service: config.EMAIL_SERVICE,
      auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: config.EMAIL_FROM,
      to: user.email, // Use user.email instead of User.email
      subject: 'One-Time Password (OTP) for Verification',
      text: `Your OTP for registration is: ${otp}`,
    };

    // Use 'await' to send the email
    await transporter.sendMail(mailOptions);

        // Set a timer to expire the OTP in 30 seconds
        // Set a timer to regenerate OTP after 30 seconds
    setTimeout(async () => {
      const currentTime = Date.now();
      const storedTimestamp = user.otpTimestamp;
      if (currentTime - storedTimestamp > 30000) {
        // OTP has expired; regenerate it
        const newOtp = generateOTP();
        user.otp = newOtp;
        user.otpTimestamp = currentTime;

        await user.save();

        // Resend the OTP via email
        // await transporter.sendMail(email, newOtp);
      }
    }, 30000);
    
    return res.status(201).json({ message: 'User registered. Please check your email for OTP verification.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message || 'Registration failed' });
  }
}

// Email verification
async function verify(req, res) {
  try {
    const { email, otp } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: error.message || 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'User is already verified' });
    }

    // if (otp !== user.otp) {
    //   return res.status(400).json({ error: 'Invalid OTP' });
    // }
    // Mark the user as verified and clear the OTP
    user.isVerified = true;
    // user.otp = undefined;
    await user.save();

    return res.status(200).json({ message: 'Email verification successful' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message || 'OTP verification failed' });
  }
}

// login user
async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    // Check if the user exists
    if (!user) {
      return res.status(401).json({ message: 'Authentication failed: User not found' });
    }

    // Check if the password is correct
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Authentication failed: Invalid password' });
    }

    // Check if the email is verified
    if (!user.isVerified) {
      return res.status(401).json({ message: "Email not verified" });
    }

    // Create and sign a JWT token for authentication
    const token = jwt.sign({ userId: user._id }, config.JWT_SECRET, { expiresIn: '1h' });

    return res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Authentication failed' });
  }
}

 // Get All users
async function getUsers(req, res) {
  try{
    const users = await User.find();
    return res.status(200).json(users);
  } catch(error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}

module.exports = {
  register, verify, loginUser, getUsers
};

