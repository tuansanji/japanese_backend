const User = require(".././model/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cookie = require("cookie");
const redis = require("redis");
const redisClient = require("../service/redisController");

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
      { id: user.id, isAdmin: user.isAdmin },
      process.env.JWT_ACCESS_TOKEN,
      { expiresIn: "2h" }
    );
  },
  generateRefreshToken: (user) => {
    return jwt.sign(
      { id: user.id, isAdmin: user.isAdmin },
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

        // refreshTokenDB.push(refreshToken);
        redisClient.RPUSH(
          "refreshTokenDB",
          JSON.stringify(refreshToken),
          (err, reply) => {
            if (err) {
              console.error(err);
            } else {
              console.log(
                `Added refreshToken to refreshTokenDB array. New length: ${reply}`
              );
            }
          }
        );

        res.cookie("refreshtoken", refreshToken, {
          httpOnly: true,
          secure: false,
          path: "/",
          sameSite: "strict",
        });
        const { password, thumb, ...other } = user._doc;
        return res.status(200).send({ ...other, accessToken });
      }
    } catch (error) {
      return res.status(500).send(error.message);
    }
  },
  requestRefreshToken: (req, res) => {
    const refreshToken = req.cookies.refreshtoken;

    if (!refreshToken) {
      return res.status(401).send("You're not authenticated một hai");
    }
    // xem token đó có tồn tài trong db hay không
    redisClient.LRANGE("refreshTokenDB", 0, -1, (err, tokens) => {
      if (err) {
        console.error(err);
      } else {
        const refreshTokenExists = tokens.some(
          (token) => token === JSON.stringify(refreshToken)
        );
        if (!refreshTokenExists) {
          return res.status(401).send("token is not in the refresh token");
        }
      }
    });

    jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN, (err, user) => {
      if (err) {
        console.log(err);
        return;
      }
      // xóa refreshtoken đó tron db
      redisClient.LREM(
        "refreshTokenDB",
        0,
        JSON.stringify(refreshToken),
        (err, reply) => {
          if (err) {
            console.error(err);
          } else {
            console.log(
              `Removed ${reply} instances of refreshToken from refreshTokenDB`
            );
          }
        }
      );
      const newAccessToken = authController.generateAccessToken(user);
      const newRefreshToken = authController.generateRefreshToken(user);

      redisClient.RPUSH(
        "refreshTokenDB",
        JSON.stringify(newRefreshToken),
        (err, reply) => {
          if (err) {
            console.error(err);
          } else {
            console.log(
              `Added refreshToken to refreshTokenDB array. New length: ${reply}`
            );
          }
        }
      );
      res.cookie("refreshtoken", newRefreshToken, {
        path: "/",
        secure: false,
        sameSite: "strict",
        httpOnly: true,
      });
      return res.status(200).send({ accessToken: newAccessToken });
    });
  },
  logOutUser: (req, res) => {
    try {
      redisClient.LREM(
        "refreshTokenDB",
        0,
        JSON.stringify(req.cookies.refreshtoken),
        (err, reply) => {
          if (err) {
            console.error(err);
          } else {
            console.log(
              `Removed ${reply} instances of refreshToken from refreshTokenDB`
            );
          }
        }
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
