const User = require(".././model/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Chưa có data base nên làm tạm bằng arr. nên học REDIS để làm cái này
let refreshTokenDB = [];

const authController = {
  registerUser: async (req, res) => {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(req.body.password, salt);
      const newUser = await new User({
        username: req.body.username,
        email: req.body.email,
        password: hashed,
      });
      const user = await newUser.save();
      return res.status(200).send(user);
    } catch (err) {
      return res.status(500).send(err.message);
    }
  },
  generateAccessToken: (user) => {
    return jwt.sign(
      { id: user.id, admin: user.isAdmin },
      process.env.JWT_ACCESS_TOKEN,
      { expiresIn: "2h" }
    );
  },
  generateRefreshToken: (user) => {
    return jwt.sign(
      { id: user.id, admin: user.isAdmin },
      process.env.JWT_REFRESH_TOKEN,
      { expiresIn: "365d" }
    );
  },
  loginUser: async (req, res) => {
    try {
      const user = await User.findOne({ username: req.body.username });
      if (!user) {
        return res.status(404).send("wrong username");
      }

      const validatedPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!validatedPassword) {
        return res.status(404).send("wrong password");
      }
      if (user && validatedPassword) {
        const accessToken = await authController.generateAccessToken(user);
        const refreshToken = await authController.generateRefreshToken(user);
        refreshTokenDB.push(refreshToken);
        await res.cookie("refreshToken", refreshToken, {
          path: "/",
          httpOnly: true,
          sameSite: "strict",
          secure: false,
        });

        const { password, ...other } = user._doc;
        return res.status(200).send({ ...other, accessToken });
      }
    } catch (error) {
      return res.status(500).send(error.message);
    }
  },
  requestRefreshToken: (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshTokenDB.includes(refreshToken)) {
      res.status(401).json("token is not in the refresh token");
    }
    jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN, (err, user) => {
      if (err) {
        console.log(err);
        return;
      }
      refreshTokenDB = refreshTokenDB.filter((token) => token !== refreshToken);
      const newAccessToken = authController.generateAccessToken(user);
      const newRefreshToken = authController.generateRefreshToken(user);
      refreshTokenDB.push(newRefreshToken);
      res.cookie("refreshToken", newRefreshToken, {
        path: "/",
        secure: false,
        sameSite: "strict",
        httpOnly: true,
      });
      res.status(200).send({ accessToken: newAccessToken });
    });
  },
  logOutUser: (req, res) => {
    try {
      res.clearCookie("refreshToken");
      refreshTokenDB = refreshTokenDB.filter(
        (token) => token != req.cookies.refreshToken
      );
      res.status(200).send("log out successfully");
    } catch (error) {
      console.log(error.message);
    }
  },
};

module.exports = authController;
