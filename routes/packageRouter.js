const express = require("express");
const { getPackageById } = require("../controllers/packageControllers");

const packageRouter = express.Router();

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
packageRouter.get('/get-package-by-id', getPackageById);

module.exports = packageRouter;