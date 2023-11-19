const admin = require("firebase-admin");

const getAllCourses = async (req, res) => {
  const db = admin.firestore();

  const coursesSnapshot = await db.collection("courses").get();

  const courses = [];
  coursesSnapshot.forEach((doc) => {
    courses.push(doc.data());
  });

  res.status(200).json(courses);
}

module.exports = { getAllCourses }