const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'The name is mandatory'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'The email is mandatory'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please, use a valid email']
  },
  password: {
    type: String,
    required: [true, 'The password is mandatory']
  },
  role: {
    type: String,
    enum: ['opositor', 'admin'],
    default: 'opositor'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.checkPassword = async function( passwordToCheck ) {
  return await bcrypt.compare(passwordToCheck, this.password);
};

module.exports = mongoose.model('User', userSchema);