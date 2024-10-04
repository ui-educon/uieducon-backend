const admin = require("firebase-admin");
const { decodeAccessToken } = require("../utils/firebase-utils");
const PDFDocument = require("pdfkit");
const { PassThrough } = require("stream");
const { default: axios } = require("axios");

const getAllQuiz = async (req, res) => {
    const db = admin.firestore();
  
    const coursesSnapshot = await db.collection("quizzes").get();
  
    const courses = [];
    coursesSnapshot.forEach((doc) => {
      courses.push(doc.data());
      console.log(doc.data());
    });
  
    res.status(200).json(courses);
  };





  module.exports={
    getAllQuiz
  }