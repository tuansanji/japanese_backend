const session = require("express-session");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
require("dotenv").config();
const UserGmail = require("../model/UserGmail");
const User = require("../model/User");
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      //   console.log(profile);
      // Xử lý khi đăng nhập thành công
      // profile chứa thông tin của người dùng đã đăng nhập
      // accessToken và refreshToken để truy cập các API của Google
      const user = await UserGmail.findOne({ username: profile.displayName });
      if (!user) {
        const newUser = await new UserGmail({
          username: profile.displayName,
          email: profile.emails[0].value,
          thumb: profile.photos[0].value,
        });
        await newUser.save();
      }

      await done(null, { ...profile, accessToken });
    }
  )
);
passport.serializeUser((user, done) => {
  done(null, user);
});

const authGmailController = {
  start: passport.authenticate("google", { scope: ["profile", "email"] }),
  callback: passport.authenticate("google", {
    failureRedirect: `${process.env.FONTEND_URL}/auth/login`,
  }),
  callbackSuccess: (req, res) => {
    const user = req.user;
    const token = jwt.sign({ user: user }, process.env.JWT_ACCESS_TOKEN, {
      expiresIn: "10d",
    });

    res.cookie("tokenGmail", token, {
      httpOnly: true,
      secure: false,
      path: "/",
      sameSite: "strict",
    });
    res.redirect(`${process.env.FONTEND_URL}`);
  },
  getUser: async (req, res) => {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
    } else {
      // const userGmail = await UserGmail.findById(user.id);
      res.json(user);
    }
  },
  logOut: (req, res) => {
    try {
      req.logout(); // xóa thông tin người dùng khỏi session
      req.session.destroy(); // xóa session
      res.clearCookie("connect.sid"); // xóa cookie
      res.sendStatus(200);
    } catch (error) {
      console.log("log out error");
    }
  },
};

module.exports = authGmailController;
