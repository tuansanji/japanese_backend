const authController = require("../controller/authController");
const middlewareController = require("../controller/middlewareController");

const multer = require("multer");
const routes = require("express").Router();
const passport = require("passport");
const session = require("express-session");
const path = require("path");
const fs = require("fs");
const User = require("../model/User");
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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ".jpg");
  },
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Only JPG, JPEG and PNG image files are allowed."));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 1000000, // Giới hạn kích thước file ảnh là 1MB
  },
  // Giới hạn kích thước và chất lượng của ảnh tải lên
  // Thêm thuộc tính transformOptions với đối tượng sharp để thực hiện chuyển đổi ảnh
  // https://github.com/lovell/sharp#resizing
  transformOptions: {
    // fit: sharp.fit.cover,
    width: 500, // Giới hạn chiều rộng ảnh là 500px
    height: 500, // Giới hạn chiều cao ảnh là 500px
    withoutEnlargement: true, // Không cho phép phóng to ảnh để đạt được kích thước giới hạn
    jpeg: {
      quality: 70, // Chất lượng ảnh JPEG là 70%
    },
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1000000, // Giới hạn kích thước file ảnh là 1MB
  },
  // fileFilter(req, file, cb) {
  //   if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
  //     return cb(new Error("Only JPG, JPEG and PNG image files are allowed."));
  //   }
  //   cb(undefined, true);
  // },
});

routes.post(
  "/user/edit",
  middlewareController.verifyToken,
  upload.single("avatar"),
  async (req, res) => {
    try {
      const user = req.user; // Lấy thông tin user từ access token
      const filePath = req.file.path;
      const fileContent = fs.readFileSync(filePath);
      const newUser = await User.findById(user.id);
      newUser.thumb = fileContent; // Lưu trữ dữ liệu ảnh dưới dạng binary

      await newUser.save();
      // Lưu thông tin user vào MongoDB
      fs.unlinkSync(filePath); // Xóa file upload sau khi lưu trữ dữ liệu
      res.status(200).send("Thay ảnh đại diện thành công");
    } catch (error) {
      res.status(500).send("Có lỗi xảy ra. Vui lòng thử lại");
    }
  }
);
routes.get("/user/avatar/:userId", (req, res) => {
  const userId = req.params.userId;
  User.findById(userId, (err, user) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.set("Content-Type", "image/png"); // Đặt kiểu MIME của dữ liệu trả về là hình ảnh PNG
    res.send(user.thumb); // Trả về dữ liệu ảnh binary
  });
});
module.exports = routes;
