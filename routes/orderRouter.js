const express = require("express");
const requireAuth = require("../middleware/require-auth");
const { createOrder } = require("../controllers/orderControllers");
const orderRouter = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     payload:order:
 *       type: object
 *       required:
 *         - course_id
 *       properties:
 *         course_id:
 *            type: "string"
 */

/**
 * @swagger
 * /order/create-order:
 *   post:
 *     summary: Create Order
 *     description: Create razorpay order instance
 *     tags:
 *       - order
 *     security:
 *       - bearerAuth: []   # Indicates that the API requires a bearer token in the header
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/payload:order'
 *     responses:
 *       200:
 *         description: Order Initiated
 */

orderRouter.post("/create-order",requireAuth, createOrder);

module.exports = orderRouter;
