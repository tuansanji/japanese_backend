const routes = require("express").Router();
const multer = require("multer");
const authController = require("../controller/authController");
const middlewareController = require("../controller/middlewareController");
const editUserController = require("../controller/editUserController");
const authGmailController = require("../controller/authGmail");

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
routes.get("/google", authGmailController.start);
routes.get(
  "/google/callback",
  authGmailController.callback,
  authGmailController.callbackSuccess
);
routes.get(
  "/user/api",
  middlewareController.verifyToken,
  authGmailController.getUser
);
routes.get("/gmail/logout", authGmailController.logOut);
//phần thay hình đại diện
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
    fileSize: 1000000,
  },

  transformOptions: {
    // fit: sharp.fit.cover,
    width: 500,
    height: 500,
    withoutEnlargement: true,
    jpeg: {
      quality: 70,
    },
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1000000,
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
  editUserController.editImage
);
routes.get("/user/avatar/:userId", editUserController.getImage);
module.exports = routes;
