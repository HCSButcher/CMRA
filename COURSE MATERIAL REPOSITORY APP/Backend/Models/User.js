const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true, // Ensure name is required
    trim: true, // Remove leading and trailing spaces
  },
  email: {
    type: String,
    required: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'], // Improved regex for emails
    unique: true, // Ensure email is unique
    lowercase: true, // Store email in lowercase for consistency
  },
  password: {
    type: String,
    required: true,
    minlength: 6, // Enforce minimum password length
  },
  role: {
    type: String,
    enum: ['admin', 'student', 'lecturer', 'Super-admin'], // Restrict roles
    required: true,
  },
  contact: {
    type: String,
    required: false, // Mark as optional
    trim: true, // Remove leading and trailing spaces
  },
  profilePicture: {
    type: String,
    required: true,
  },
  course: {
    type: String,
    required: false,
    default: '', // Default to an empty string
  },
  registrationNumber: {
    type: String,
    required: false,
    default: '', // Default to an empty string
  },
  resetPasswordToken: {
    type: String,
    required: false, // Optional field for password resets
  },
  resetPasswordExpires: {
    type: Date,
    required: false, // Optional field for password reset expiry
  },
  date: {
    type: Date,
    default: Date.now, // Default to current date
  },
});

// Create and export the model
const User = mongoose.model('User', userSchema);
module.exports = User;
