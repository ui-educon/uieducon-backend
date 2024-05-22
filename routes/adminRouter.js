const express = require("express");
const { pushResources } = require("../controllers/backendScriptControllers");

const adminRouter = express.Router();

adminRouter.get("/push-resources", pushResources);

module.exports = adminRouter;
