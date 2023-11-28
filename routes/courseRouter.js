const express = require("express");
const { getAllCourses, getCourseById } = require("../controllers/courseControllers");

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
courseRouter.get("/get-all-courses", getAllCourses);

/**
 * @swagger
 * /course/get-course-by-id:
 *   get:
 *     summary: Get all course doc by id
 *     tags:
 *       - course
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: course_id
 *         description: Course Id
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A course doc
 */
courseRouter.get("/get-course-by-id", getCourseById);

module.exports = courseRouter;
