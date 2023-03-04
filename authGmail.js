const UserGmail = require("./model/UserGmail");

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
require("dotenv").config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      //   console.log(profile);
      // Xử lý khi đăng nhập thành công
      // profile chứa thông tin của người dùng đã đăng nhập
      // accessToken và refreshToken để truy cập các API của Google
      done(null, { ...profile, accessToken });
    }
  )
);
