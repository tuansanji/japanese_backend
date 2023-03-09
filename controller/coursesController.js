const { response } = require("express");
const Course = require("../model/Course");

const coursesController = {
  postCourse: async (req, res) => {
    try {
      const newCourse = await new Course({
        name: req.body.name,
        lesson: req.body.lesson,
        way: req.body.way,
        stage: req.body.stage,
        level: req.body.level,
        author: req.body.author,
        pathVideo: req.body.pathVideo,
        pdf: req.body.pdf,
        desc: req.body.desc,
        audio: req.body.audio,
      });
      console.log(newCourse);

      const course = await newCourse.save();
      res.status(200).send("post successfully created");
    } catch (error) {
      res.status(500).send("post failed");
    }
  },

  // thên thời gian của video
  addTimeLine: async (req, res) => {
    try {
      const course = await Course.findById(req.body.id);
      course.timeLine = req.body.timeLine;
      course.save();
      res.status(200).send("add timeLine successfully ");
    } catch (error) {
      res.status(500).send("add timeline error");
    }
  },

  deleteCourse: async (req, res) => {
    try {
      const course = await Course.findByIdAndDelete(req.body.id);
      res.status(200).send("delete successfully");
    } catch (error) {
      res.status(500).send("delete failed");
    }
  },
  deleteManyCourse: async (req, res) => {
    try {
      const course = await Course.deleteMany({ _id: { $in: req.body.arr } });
      res.status(200).send("delete many successfully");
    } catch (error) {
      res.status(500).send("delete many failed");
    }
  },
  editCourse: async (req, res) => {
    try {
      const course = await Course.findByIdAndUpdate(req.body.id, {
        name: req.body.name,
        lesson: req.body.lesson,
        stage: req.body.stage,
        way: req.body.way,
        level: req.body.level,
        pathVideo: req.body.pathVideo,
        pdf: req.body.pdf,
        desc: req.body.desc,
        author: req.body.author,
        audio: req.body.audio,
      });
      res.status(200).send("edit successfully updated");
    } catch (error) {
      res.status(500).send("edit failed");
    }
  },
  getCourseAll: async (req, res) => {
    try {
      const courses = await Course.find();
      res.status(200).send(courses);
    } catch (error) {
      res.status(500).send("courses not found");
    }
  },
  getCourseLevel: async (req, res) => {
    try {
      const courses = await Course.find({ level: req.params.level });
      res.status(200).json(courses);
    } catch (error) {
      res.status(500).send("level not found");
    }
  },
  getCourseWay: async (req, res) => {
    try {
      const courses = await Course.find({
        level: req.params.level.split("+").join(" "),
        way: req.params.way.split("+").join(" "),
      });

      res.status(200).json(courses);
    } catch (error) {
      res.status(500).send("way not found");
    }
  },
  getCourseStage: async (req, res) => {
    try {
      const courses = await Course.find({
        level: req.params.level,
        way: req.params.way.split("+").join(" "),
        stage: req.params.stage.split("+").join(" "),
      });

      res.status(200).json(courses);
    } catch (error) {
      res.status(500).send("stage not found");
    }
  },
  getCourseLesson: async (req, res) => {
    try {
      const courses = await Course.find({
        level: req.params.level,
        way: req.params.way.split("+").join(" "),
        stage: req.params.stage.split("+").join(" "),
        lesson: req.params.lesson.split("+").join(" "),
      });
      res.status(200).json(courses);
    } catch (error) {
      res.status(500).send("lesson not found");
    }
  },
  getCourseName: async (req, res) => {
    try {
      const courses = await Course.find({
        level: req.params.level,
        way: req.params.way.split("+").join(" "),
        stage: req.params.stage.split("+").join(" "),
        lesson: req.params.lesson.split("+").join(" "),
        name: req.params.name.split("+").join(" "),
      });
      res.status(200).json(courses);
    } catch (error) {
      res.status(500).send("lesson not found");
    }
  },
};

module.exports = coursesController;
