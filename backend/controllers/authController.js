const User = require('../models/User');
const jwt = require('jsonwebtoken');


const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validation
    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please enter all fields (name, email, password)');
    }

    if (password.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters long');
    }

    // 2. Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log(`Registration failed: User already exists (${email})`);
      res.status(400);
      throw new Error('User already exists with this email');
    }

    // 3. Create user
    const user = await User.create({ name, email, password });

    if (user) {
      console.log(`New user registered: ${user.email}`);
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data received');
    }
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Validation
    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide both email and password');
    }

    // 2. Find user
    // We explicitly select +password in case it was set to select: false in schema (future proof)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log(`Login attempt failed: User not found for email ${email}`);
      res.status(401);
      throw new Error('Invalid email or password');
    }

    // 3. Compare Password
    const isMatch = await user.comparePassword(password);
    
    if (isMatch) {
      console.log(`User logged in: ${user.email}`);
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      console.log(`Login attempt failed: Incorrect password for ${email}`);
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser, loginUser };
