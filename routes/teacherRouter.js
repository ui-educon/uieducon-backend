const express = require("express");
const multer = require("multer");
const storage = multer.memoryStorage();
// const upload = multer({ storage });
const {mapManagerTeacher} = require("../controllers/teacherController");

const teacherRouter = express.Router();

teacherRouter.post("/map-teacher", mapManagerTeacher);


module.exports = teacherRouter;
