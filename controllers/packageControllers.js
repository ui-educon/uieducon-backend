const admin = require("firebase-admin");

const getPackageById = async (req, res) => {
  const db = admin.firestore();

  const packageId = req.query.package_id;

  if (!packageId) {
    return res.status(400).send("Package Id Required");
  }

  const packageDocRef = await db.collection("packages").doc(packageId).get();

  if (packageDocRef.exists) {
    const packageDocData = packageDocRef.data();

    const courseId = packageDocData.courseId;
    const courseDocRef = await db.collection("courses").doc(courseId).get();
    packageDocData.courseData = courseDocRef.data();

    res.json(packageDocData);
  } else {
    res.json(null);
  }

}

module.exports = { getPackageById }