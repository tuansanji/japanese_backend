const coursesController = require("../controller/coursesController");
const middlewareController = require("../controller/middlewareController");
const routes = require("express").Router();

routes.post(
  "/",
  middlewareController.verifyTokenAndAdminAuth,
  coursesController.postCourse
);
routes.post(
  "/delete",
  middlewareController.verifyTokenAndAdminAuth,
  coursesController.deleteCourse
);
routes.post(
  "/delete/many",
  middlewareController.verifyTokenAndAdminAuth,
  coursesController.deleteManyCourse
);
routes.patch(
  "/edit",
  middlewareController.verifyTokenAndAdminAuth,
  coursesController.editCourse
);
routes.get(
  "/",
  middlewareController.verifyTokenAndAdminAuth,
  coursesController.getCourseAll
);
routes.get("/:level", coursesController.getCourseLevel);
routes.get("/:level/:way", coursesController.getCourseWay);
routes.get("/:level/:way/:stage", coursesController.getCourseStage);
routes.get("/:level/:way/:stage/:lesson", coursesController.getCourseLesson);
routes.get(
  "/:level/:way/:stage/:lesson/:name",
  coursesController.getCourseName
);
module.exports = routes;
