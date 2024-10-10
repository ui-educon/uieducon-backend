const express = require("express");
const { liveVideoWebhook, instantLiveStream, scheduleLiveStream, startScheduledLiveStream, stopLiveStream, deleteWebhook, createWebhook } = require("../controllers/liveVideoControllers");
// const requireAuth = require("../middleware/require-auth");
// const { createOrder } = require("../controllers/orderControllers");
const liveVideoRouter = express.Router();


liveVideoRouter.post("/getWebhook",liveVideoWebhook)

liveVideoRouter.post("/instantLiveStream",instantLiveStream)
liveVideoRouter.post("/scheduleLiveStream",scheduleLiveStream)
liveVideoRouter.get("/startScheduledLive",startScheduledLiveStream)
liveVideoRouter.get("/stopLive",stopLiveStream)
liveVideoRouter.delete("/deleteWebhook",deleteWebhook)



liveVideoRouter.post("/createWebhook",createWebhook)
// orderRouter.post("/create-order",requireAuth, createOrder);

module.exports = liveVideoRouter;