const coursesController = require("../controller/coursesController");

const routes = require("express").Router();

routes.post("/", coursesController.postCourse);
routes.get("/", coursesController.getCourseAll);
routes.get("/:level", coursesController.getCourseLevel);
routes.get("/:level/:way", coursesController.getCourseWay);
routes.get("/:level/:way/:stage", coursesController.getCourseStage);
routes.get("/:level/:way/:stage/:lesson", coursesController.getCourseLesson);
routes.get(
  "/:level/:way/:stage/:lesson/:name",
  coursesController.getCourseName
);
module.exports = routes;
