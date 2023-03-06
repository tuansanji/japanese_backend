const User = require(".././model/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cookie = require("cookie");
// Chưa có data base nên làm tạm bằng arr. nên học REDIS để làm cái này
let refreshTokenDB = [];

const authController = {
  registerUser: async (req, res) => {
    try {
      const userNameValidate = await User.findOne({
        username: req.body.username,
      });
      if (userNameValidate) {
        return res.status(403).send("Tên đăng nhập đã tồn tại");
      }
      const emailValidate = await User.findOne({ email: req.body.email });
      if (emailValidate) {
        return res.status(403).send("Email đã tồn tại");
      }
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
      { expiresIn: "10d" }
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
        const accessToken = authController.generateAccessToken(user);
        const refreshToken = authController.generateRefreshToken(user);

        refreshTokenDB.push(refreshToken);

        res.cookie("refreshtoken", refreshToken, {
          httpOnly: true,
          secure: false,
          path: "/",
          sameSite: "strict",
        });
        const { password, ...other } = user._doc;
        return res.status(200).send({ ...other, accessToken });
      }
    } catch (error) {
      return res.status(500).send(error.message);
    }
  },
  requestRefreshToken: (req, res) => {
    const refreshToken = req.cookies.refreshtoken;

    if (!refreshToken)
      return res.status(401).json("You're not authenticated một hai");

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
      res.cookie("refreshtoken", newRefreshToken, {
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
      refreshTokenDB = refreshTokenDB.filter(
        (token) => token !== req.cookies.refreshtoken
      );
      res.clearCookie("refreshtoken");

      res.status(200).send("log out successfully");
    } catch (error) {
      console.log(error.message);
    }
  },
  editUser: async (req, res) => {
    const user = await User.findOne({ username: req.body.username });
  },
};

module.exports = authController;
