const express = require("express");
const admin = require("firebase-admin");
const { decodeAccessToken } = require("../utils/firebase-utils");
const requireAuth = require("../middleware/require-auth");
const { getAllPackagesPurchased } = require("../controllers/userControllers");
const userRouter = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     payload:user:
 *       type: object
 *       properties:
 *         name:
 *            type: "string"
 *         email:
 *            type: "string"
 *         photoUrl:
 *            type: "string"
 *         others:
 *            type: "any"
 */

/**
 * @swagger
 * /user/all-users:
 *   get:
 *     summary: Get all users
 *     tags:
 *       - user
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: A list of all users
 */

userRouter.get("/all-users", (req, res) => {
  const db = admin.firestore();

  // Access Firestore collections and documents as needed
  db.collection("users")
    .get()
    .then((snapshot) => {
      const users = [];
      snapshot.forEach((doc) => {
        users.push(doc.data());
      });
      res.status(200).json(users);
    })
    .catch((error) => {
      console.error("Error getting users", error);
      res.status(500).send("Internal Server Error");
    });
});

/**
 * @swagger
 * /user/create-user:
 *   post:
 *     summary: Create a new user
 *     description: creates a new user in firestore db
 *     tags:
 *       - user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: New user created successfully
 *       401:
 *         description: Error verifying access token
 *       500:
 *         description: Internal Server Error
 */

userRouter.post("/create-user", async (req, res) => {
  const accessToken = req.headers.authorization;

  try {
    const decodedToken = await decodeAccessToken(accessToken);
    try {
      const db = admin.firestore();
      const uid = decodedToken.uid;
      let userDefaultData = {
        email: decodedToken?.email || "",
        name: decodedToken?.name || "",
        photoUrl: decodedToken?.picture || "",
      };

      // TODO: Check if user already exists, else it will complete replace existing doc with new one !!

      db.collection("users")
        .doc(uid)
        .set(userDefaultData)
        .then((docRef) => {
          console.log("New user added with ID:", docRef);
          res.status(201).send("New user created successfully");
        })
        .catch((error) => {
          console.error("Error adding new user:", error);
          res.status(500).send("Internal Server Error");
        });
    } catch (error) {
      console.error("Error retrieving user data:", error);
      return res.status(500).send("Internal Server Error");
    }
  } catch (error) {
    console.error("Error verifying access token:", error);
    return res.status(401).send("Unauthorized");
  }
});

/**
 * @swagger
 * /user/update-user:
 *   post:
 *     summary: Update user data
 *     description: updates an existing user data in firestore
 *     tags:
 *       - user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/payload:user'
 *     responses:
 *       200:
 *         description: User updated successfully
 *       401:
 *         description: Error verifying access token
 *       500:
 *         description: Internal Server Error
 */

userRouter.post("/update-user", async (req, res) => {
  const accessToken = req.headers.authorization;

  try {
    const decodedToken = await decodeAccessToken(accessToken);
    try {
      const db = admin.firestore();
      const uuid = decodedToken.user_id;

      db.collection("users")
        .doc(uuid)
        .set(req.body)
        .then((docRef) => {
          console.log("User updated with ID:", docRef);
          res.status(201).send("User data updated successfully");
        })
        .catch((error) => {
          console.error("Error updating user:", error);
          res.status(500).send("Internal Server Error");
        });
    } catch (error) {
      console.error("Error retrieving user data:", error);
      return res.status(500).send("Internal Server Error");
    }
  } catch (error) {
    console.error("Error verifying access token:", error);
    return res.status(401).send("Unauthorized");
  }
});

/**
 * @swagger
 * /user/get-details-by-id:
 *   get:
 *     summary: Get user's data
 *     tags:
 *       - user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: user_id
 *         description: ID of the user
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: User data
 *       400:
 *         description: User id required
 *       404:
 *         description: User Not Found
 *       500:
 *         description: Internal Server Error
 */

userRouter.get("/get-details-by-id", async (req, res) => {
  const db = admin.firestore();

  const userId = req.query.user_id;

  if (!userId) {
    return res.status(400).send("User Id Required");
  }

  const usersRef = db.collection("users").doc(userId);
  usersRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        const userData = doc.data();
        res.status(200).json(userData);
      } else {
        res.status(404).send("User not found");
      }
    })
    .catch((error) => {
      console.error("Error getting user data:", error);
      res.status(500).send("Internal Server Error");
    });
});

/**
 * @swagger
 * /user/get-all-packages-purchased:
 *   get:
 *     summary: Get packages purchased by the user
 *     tags:
 *       - user
 *     produces:
 *       - application/json
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User data
 *       400:
 *         description: User id required
 *       404:
 *         description: User Not Found
 *       500:
 *         description: Internal Server Error
 */
userRouter.get("/get-all-packages-purchased", requireAuth, getAllPackagesPurchased);

module.exports = userRouter;
