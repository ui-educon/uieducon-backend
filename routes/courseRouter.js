const express = require("express");
const { getAllCourses } = require("../controllers/courseControllers");

const courseRouter = express.Router();

/**
 * @swagger
 * /course/get-all-courses:
 *   get:
 *     summary: Get all courses
 *     tags:
 *       - course
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: A list of all courses
 */
courseRouter.get('/get-all-courses', getAllCourses);

module.exports = courseRouter;