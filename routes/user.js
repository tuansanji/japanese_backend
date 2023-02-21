const middlewareController = require("../controller/middlewareController");
const userController = require("../controller/userController");

const routes = require("express").Router();

routes.get(
  "/all",
  middlewareController.verifyToken,
  userController.getAllUsers
);
routes.delete(
  "/delete/:id",
  middlewareController.verifyTokenAndAdminAuth,
  userController.deleteUser
);

module.exports = routes;
