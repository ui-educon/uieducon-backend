const express = require("express");
const { liveVideoWebhook } = require("../controllers/liveVideoControllers");
// const requireAuth = require("../middleware/require-auth");
// const { createOrder } = require("../controllers/orderControllers");
const liveVideoRouter = express.Router();

liveVideoRouter.post("/getWebhook",liveVideoWebhook)
// orderRouter.post("/create-order",requireAuth, createOrder);

module.exports = liveVideoRouter;