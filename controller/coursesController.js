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
      });
      const course = await newCourse.save();
      res.status(200).send("post successfully created");
    } catch (error) {
      res.status(500).send("post failed");
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
