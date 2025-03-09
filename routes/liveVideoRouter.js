const express = require("express");
const { liveVideoWebhook, instantLiveStream, scheduleLiveStream, startScheduledLiveStream, stopLiveStream, deleteWebhook, createWebhook, getFcmToken , setFcmToken, getLiveVideos,getAllLiveVideos, startStreamConnection} = require("../controllers/liveVideoControllers");
// const requireAuth = require("../middleware/require-auth");
const checkTeacher = require("..//middleware/check-teacher")
const checkCorrectTeacher = require("..//middleware/check-correct-teacher")
const checkSuperAdmin = require("..//middleware/check-superAdmin")
const checkManager = require("..//middleware/check-manager")
// const { createOrder } = require("../controllers/orderControllers");
const liveVideoRouter = express.Router();



// liveVideoRouter.post("/getWebhook", liveVideoWebhook)

// liveVideoRouter.post("/instantLiveStream", instantLiveStream)
// liveVideoRouter.post("/scheduleLiveStream", scheduleLiveStream)
// liveVideoRouter.get("/startScheduledLive", checkTeacher, checkCorrectTeacher, startScheduledLiveStream)
// liveVideoRouter.get("/stopLive", checkTeacher, stopLiveStream)
// liveVideoRouter.delete("/deleteWebhook", checkSuperAdmin, deleteWebhook)
// liveVideoRouter.post("/createWebhook", checkSuperAdmin,createWebhook)

// liveVideoRouter.get("/sendFcmToken",  setFcmToken)

liveVideoRouter.post("/getWebhook", liveVideoWebhook)

liveVideoRouter.post("/instantLiveStream", instantLiveStream)
liveVideoRouter.post("/scheduleLiveStream", scheduleLiveStream)
liveVideoRouter.get("/startScheduledLive", startScheduledLiveStream)
liveVideoRouter.get("/stopLive",  stopLiveStream)
liveVideoRouter.delete("/deleteWebhook", deleteWebhook)

liveVideoRouter.get("/sendFcmToken",  setFcmToken)
liveVideoRouter.get("/getLiveVideos",  getLiveVideos)
liveVideoRouter.get("/getAllLiveVideos",  getAllLiveVideos)
liveVideoRouter.get("/streamStatus",  startStreamConnection)


liveVideoRouter.post("/createWebhook", createWebhook)
// orderRouter.post("/create-order",requireAuth, createOrder);

module.exports = liveVideoRouter;