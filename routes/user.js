const middlewareController = require("../controller/middlewareController");
const userController = require("../controller/userController");

const routes = require("express").Router();

routes.get(
  "/all",

  middlewareController.verifyTokenAndAdminAuth,
  userController.getAllUsers
);
routes.post(
  "/delete",
  middlewareController.verifyTokenAndAdminAuth,
  userController.deleteUser
);
routes.post(
  "/delete/many",
  middlewareController.verifyTokenAndAdminAuth,
  userController.deleteManyUsers
);
routes.patch(
  "/edit",
  middlewareController.verifyTokenAndAdminAuth,
  userController.editUser
);
routes.post("/forgot-password", userController.forgotPassWord);
routes.get("/change-password/:token", userController.changePassword);
routes.patch("/confirm-password/:token", userController.confirmPasswordChange);

module.exports = routes;
