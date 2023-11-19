const express = require("express");
const { getPackageById, createPackageOrder } = require("../controllers/packageControllers");
const requireAuth = require("../middleware/require-auth");

const packageRouter = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     payload:package:
 *       type: object
 *       required:
 *         - course_id
 *       properties:
 *         course_id:
 *            type: "string"
 *         order_creation_id:
 *            type: "string"
 *         razorpay_payment_id:
 *            type: "string"
 *         others:
 *            type: "any"
 */

/**
 * @swagger
 * /package/get-package-by-id:
 *   get:
 *     summary: Get all package doc by id
 *     tags:
 *       - package
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: package_id
 *         description: Package Id
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A package doc
 */
packageRouter.get("/get-package-by-id", getPackageById);

/**
 * @swagger
 * /package/create-package-order:
 *   post:
 *     summary: Create New Package
 *     description: Create New Package after purchase
 *     tags:
 *       - package
 *     security:
 *       - bearerAuth: []   # Indicates that the API requires a bearer token in the header
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/payload:package'
 *     responses:
 *       200:
 *         description: Package Order Created
 */

packageRouter.post("/create-package-order", requireAuth, createPackageOrder);

module.exports = packageRouter;
