const authController = require("../controller/authController");
const middlewareController = require("../controller/middlewareController");

const routes = require("express").Router();

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

module.exports = routes;
