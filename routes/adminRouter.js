const express = require("express");
const {
  pushResources,
  createPackages,
  updateSequence,
  getData,
  pushQuiz
} = require("../controllers/backendScriptControllers");

const adminRouter = express.Router();

adminRouter.get("/push-resources", pushResources);
adminRouter.get("/create-packages", createPackages);
adminRouter.get("/update-sequence", updateSequence);
adminRouter.get("/getStats", getData);
adminRouter.get("/pushQuiz", pushQuiz);

module.exports = adminRouter;
