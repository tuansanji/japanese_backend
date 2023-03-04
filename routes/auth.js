const authController = require("../controller/authController");
const middlewareController = require("../controller/middlewareController");

const multer = require("multer");
const routes = require("express").Router();
const passport = require("passport");
const session = require("express-session");

const upload = multer({
  limits: {
    fileSize: 1000000, // Giới hạn kích thước file ảnh là 1MB
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Only JPG, JPEG and PNG image files are allowed."));
    }
    cb(undefined, true);
  },
});

passport.serializeUser((user, done) => {
  done(null, user);
});
routes.post("/register", authController.registerUser);
routes.post("/login", authController.loginUser);
routes.post(
  "/refresh",
  // middlewareController.verifyToken,
  authController.requestRefreshToken
);
routes.post(
  "/logout",
  middlewareController.verifyToken,
  authController.logOutUser
);
// Thiết lập router cho đăng nhập Google

routes.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

routes.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:3000/auth/login",
  }),
  (req, res) => {
    const user = req.user;
    console.log(user);
    res.redirect("http://localhost:3000");
  }
);

routes.get("/user/api", (req, res) => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
  } else {
    res.json(user);
  }
  // if (req.isAuthenticated()) {
  //   res.send(req.user);
  // } else {
  //   res.status(401).send("User not authenticated");
  // }
});

routes.get("/gmail/logout", (req, res) => {
  try {
    req.logout(); // xóa thông tin người dùng khỏi session
    req.session.destroy(); // xóa session
    res.clearCookie("connect.sid"); // xóa cookie
    res.sendStatus(200);
  } catch (error) {
    console.log("log out error");
  }
});

routes.post("/user/edit", upload.single("avatar"), async (req, res) => {
  try {
    const user = req.user; // Lấy thông tin user từ access token
    user.thumb = req.file.buffer; // Lưu trữ dữ liệu ảnh dưới dạng binary
    await user.save(); // Lưu thông tin user vào MongoDB
    res.status(200).send();
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = routes;
