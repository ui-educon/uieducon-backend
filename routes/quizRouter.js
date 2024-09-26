const express = require("express");
const admin = require("firebase-admin");
const { decodeAccessToken } = require("../utils/firebase-utils");
const requireAuth = require("../middleware/require-auth");
// const { getAllPackagesPurchased } = require("../controllers/userControllers");
// const { getClientGeolocation } = require("../controllers/geoLocation");
const quizRouter = express.Router();



/**
 * @swagger
 * /quiz/all-quizzes:
 *   get:
 *     summary: Get all quiz
 *     tags:
 *       - quiz
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: A list of all quiz
 */

quizRouter.get("/all-quizzes", (req, res) => {
    const db = admin.firestore();
  
    // Access Firestore collections and documents as needed
    db.collection("quizzes")
      .get()
      .then((snapshot) => {
        const quiz = [];
        snapshot.forEach((doc) => {
          quiz.push(doc.data());
        });
        res.status(200).json(quiz);
      })
      .catch((error) => {
        console.error("Error getting quizs", error);
        res.status(500).send("Internal Server Error");
      });
  });
  

  

  /**
   * @swagger
   * /quiz/get-quiz-by-id:
   *   get:
   *     summary: Get quiz data
   *     tags:
   *       - quiz
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: quiz_id
   *         description: ID of the quiz
   *         in: query
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Quiz data
   *       400:
   *         description: Quiz id required
   *       404:
   *         description: Quiz Not Found
   *       500:
   *         description: Internal Server Error
   */
  
  quizRouter.get("/get-quiz-by-id", async (req, res) => {
    const db = admin.firestore();
  
    const quizId = req.query.quiz_id;
  
    if (!quizId) {
      return res.status(400).send("Quiz Id Required");
    }
  
    const quizsRef = db.collection("quizzes").doc(quizId);
    quizsRef
      .get()
      .then((doc) => {
        if (doc.exists) {
          const quizData = doc.data();
          res.status(200).json(quizData);
        } else {
          res.status(404).send("Quiz not found");
        }
      })
      .catch((error) => {
        console.error("Error getting quiz data:", error);
        res.status(500).send("Internal Server Error");
      });
  });
  
  
  module.exports = quizRouter;
  