const admin = require("firebase-admin");
const { decodeAccessToken } = require("../utils/firebase-utils");
const PDFDocument = require("pdfkit");
const { PassThrough } = require("stream");
const { default: axios } = require("axios");

const getAllCourses = async (req, res) => {
  const db = admin.firestore();

  const coursesSnapshot = await db.collection("courses").get();

  const courses = [];
  coursesSnapshot.forEach((doc) => {
    courses.push(doc.data());
    console.log(doc.data());
  });

  res.status(200).json(courses);
};

const getCourseById = async (req, res) => {
  const db = admin.firestore();

  const courseId = req.query.course_id;

  if (!courseId) {
    return res.status(400).send("Course Id Required");
  }

  const courseDocResponse = await db.collection("courses").doc(courseId);
  const courseDocRef = await courseDocResponse.get();

  if (courseDocRef.exists) {
    const courseDocData = courseDocRef.data();
    const resourcesList = courseDocData?.sequence;
    const promises = resourcesList.map(async (item) => {
      try {
        if (item.type === "video" || item.type === "liveVideo") {
          // fetch and return data object if exists
          const resourceDocResponse = await db
            .collection("resources")
            .doc(item.recordId);
          const resourceDocRef = await resourceDocResponse.get();
          const courseData = resourceDocRef.data();
          return courseData;
        }
        else if (item.type === "quiz") {
          const quizzesDocResponse = await db
            .collection("quizzes")
            .doc(item.recordId);
          const quizzesDocRef = await quizzesDocResponse.get();
          const quizData = quizzesDocRef.data();
          return quizData;
        }

      } catch (error) {
        return null;
      }
    });
    courseDocData.sequence = await Promise.all(promises);
    res.status(200).json(courseDocData);
  } else {
    res.status(404).json(null);
  }
};

const getCourseCompletionCertificate = async (req, res) => {
  try {
    const accessToken = req.headers.authorization;
    const { packageId } = req.query;
    if (!accessToken || !packageId)
      return res.status(400).json({
        error: "Bad request",
        message: "accessToken or package id missing",
      });
    const decodedToken = await decodeAccessToken(accessToken);
    const uuid = decodedToken.user_id;

    const db = admin.firestore();
    const userData = (await db.collection("users").doc(uuid).get()).data();

    // const userData = userSnapshot.data();

    // console.log(userSnapshot);

    const packageRef = db.collection("packages").doc(packageId);
    const packageRes = (await packageRef.get()).data();
    const courseref = db.collection("courses").doc(packageRes.courseId);
    const courseRes = (await courseref.get()).data();

    if (packageRes.currentIndex < courseRes.sequence.length - 1)
      return res
        .status(400)
        .json({ error: "Bad request", message: "Complete the course!!" });

    const doc = new PDFDocument({
      layout: "landscape",
      size: "A4",
    });
    const stream = new PassThrough();

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=certificate_${userData.name}.pdf`
    );
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(stream);

    let image = await axios.get(courseRes.certificateTemplate, {
      responseType: "arraybuffer",
    });

    doc.image(image.data, 0, 0, {
      width: doc.page.width,
      height: doc.page.height,
    });

    doc.moveDown(13);
    doc.fontSize(36).fillColor("#000").text(userData.name, {
      align: "center",
    });

    // Finalize the PDF and end the stream
    doc.end();

    stream.pipe(res);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Interval server error",
    });
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  getCourseCompletionCertificate,
};
