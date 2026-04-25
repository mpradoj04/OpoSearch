const User = require("../models/User");
const jwt = require("jsonwebtoken");

const registerUser = async (userData) => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new Error("Email already registered");
  }
  const newUser = new User(userData);
  await newUser.save();
  return newUser;
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await user.checkPassword(password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const payload = {
    id: user._id,
    role: user.role,
  };

  const JWT_SECRET = process.env.JWT_SECRET;
  const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });

  return { user, accessToken, refreshToken };
};

const refreshAccessToken = async (token) => {
  const JWT_SECRET = process.env.JWT_SECRET;
  const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) throw new Error("User no longer exists");

    const payload = {
      id: user._id,
      role: user.role,
    };

    const newAccessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
    return newAccessToken;
  } catch (error) {
    throw new Error("Invalid or expired refresh token" + error.message, { cause: error });
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
};
