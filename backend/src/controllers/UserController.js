const userService = require("../services/UserService");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email and password are required" });
    }

    const user = await userService.registerUser({ name, email, password });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.message === "Email already registered") {
      return res.status(409).json({ error: error.message });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }

    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const { user, accessToken, refreshToken } = await userService.loginUser(
      email,
      password,
    );

    res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.message === "Invalid credentials") {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: "Refresh token is required" });
    }

    const accessToken = await userService.refreshAccessToken(token);

    res.status(200).json({
      message: "Token refreshed successfully",
      accessToken,
    });
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
};
