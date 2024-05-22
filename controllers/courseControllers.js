const admin = require("firebase-admin");
const { decodeAccessToken } = require("../utils/firebase-utils");
const PDFDocument = require("pdfkit");
const { PassThrough } = require("stream");

const getAllCourses = async (req, res) => {
  const db = admin.firestore();

  const coursesSnapshot = await db.collection("courses").get();

  const courses = [];
  coursesSnapshot.forEach((doc) => {
    courses.push(doc.data());
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
    const promises = resourcesList.map(async (recordId) => {
      try {
        // fetch and return data object if exists
        const resourceDocResponse = await db
          .collection("resources")
          .doc(recordId);
        const resourceDocRef = await resourceDocResponse.get();
        const courseData = resourceDocRef.data();
        return courseData;
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
    const userSnapshot = await db
      .collection("users")
      .where("userId", "==", uuid)
      .get();

    // console.log(userSnapshot);

    const packageRef = db.collection("packages").doc(packageId);
    const packageRes = (await packageRef.get()).data();
    const courseref = db.collection("courses").doc(packageRes.courseId);
    const courseRes = (await courseref.get()).data();

    if (packageRes.currentIndex < courseRes.sequence.length - 1)
      return res
        .status(400)
        .json({ error: "Bad request", message: "Complete the course!!" });

    const doc = new PDFDocument();
    const stream = new PassThrough();

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=certificate_${"Sandeep"}.pdf`
    );
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(stream);

    // Certificate Design
    doc.rect(0, 0, doc.page.width, doc.page.height).fill("#fff");
    doc.fillColor("#000");

    // Certificate title
    doc.fontSize(30).text("Certificate of Achievement", {
      align: "center",
      underline: true,
    });

    // Add some space
    doc.moveDown(3);

    // Add name
    doc.fontSize(20).fillColor("#FF5733").text(`This is to certify that`, {
      align: "center",
    });

    doc.moveDown(1);

    doc.fontSize(25).fillColor("#FF5733").text("Sandeep", {
      align: "center",
      underline: true,
    });

    // Add some space
    doc.moveDown(2);

    // Add description
    doc
      .fontSize(18)
      .fillColor("#000")
      .text(`has successfully completed the course`, {
        align: "center",
      });

    doc.moveDown(1);

    doc
      .fontSize(18)
      .fillColor("#000")
      .text(`"Node.js and PDFKit for Beginners"`, {
        align: "center",
        italic: true,
      });

    // Add some space
    doc.moveDown(5);

    // Add details
    doc
      .fontSize(16)
      .fillColor("#000")
      .text(`Issued on ${new Date().toLocaleDateString()}`, {
        align: "center",
      });

    // Finalize the PDF and end the stream
    doc.end();

    stream.pipe(res);
  } catch (error) {
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
