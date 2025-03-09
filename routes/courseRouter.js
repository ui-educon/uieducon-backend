const express = require("express");
const multer = require("multer");
const storage = multer.memoryStorage();
// const upload = multer({ storage });
const {
  getAllCourses,
  getCourseById,
  getCourseCompletionCertificate,
  getAllCoursesForAdmin,
  approveCourse,
  rejectCourse
} = require("../controllers/courseControllers");
const { getPlayableLink } = require("../controllers/contentDataControllers");
const { changeFolderOfUploadedVideo } = require("../controllers/contentDataControllers");
const { pushResourcesReq, createCourse } = require("../controllers/backendScriptControllers");
const { getUnapprovedCourses } = require("../controllers/teacherController");
const checkTeacher = require("../middleware/check-teacher");
const checkManager = require("../middleware/check-manager");
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
courseRouter.get("/unapproved-courses", checkTeacher,getUnapprovedCourses);
courseRouter.get("/get-all-courses-for-admin", getAllCoursesForAdmin);

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
 *       - name: videoId
 *         description: corresponding video id in tpstreams
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Playable link
 */
courseRouter.get("/get-playable-link", getPlayableLink);

courseRouter.get("/getCertificate", getCourseCompletionCertificate);

courseRouter.post("/submit-course", checkTeacher,createCourse);

courseRouter.post("/approve-course", approveCourse)
courseRouter.post("/reject-course", rejectCourse)
courseRouter.post("/change-folder", changeFolderOfUploadedVideo)
module.exports = courseRouter;
