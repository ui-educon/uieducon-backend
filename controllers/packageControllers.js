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
};

const updateIndex = async (req, res) => {
  const { packageId } = req.body;

  console.log(packageId);

  if (!packageId)
    return res
      .status(400)
      .json({ error: "Bad request", message: "Package id missing" });

  const db = admin.firestore();
  const packageRef = db.collection("packages").doc(packageId);

  const response = await packageRef.update({
    currentIndex: FieldValue.increment(1),
  });

  return res.status(200).json({ message: "Index updated successfully!" });
};

module.exports = { getPackageById, updateIndex };
