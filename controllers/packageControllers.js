const admin = require("firebase-admin");
const { decodeAccessToken } = require("../utils/firebase-utils");

const getPackageById = async (req, res) => {
  const db = admin.firestore();

  const packageId = req.query.package_id;

  if (!packageId) {
    return res.status(400).send("Package Id Required");
  }

  const packageDocResponse = await db.collection("packages").doc(packageId);
  const packageDocRef = await packageDocResponse.get();

  if (packageDocRef.exists) {
    let packageDocData = packageDocRef.data();
    const courseId = packageDocData.courseId;
    const courseDocRef = await db.collection("courses").doc(courseId).get();
    packageDocData.courseData = courseDocRef.data();
    res.status(200).json(packageDocData);
  } else {
    res.status(404).json(null);
  }
};

const createPackageOrder = async (req, res) => {
  const db = admin.firestore();
  const authToken = req.headers.authorization;
  const decodedToken = await decodeAccessToken(authToken);
  const userId = decodedToken.uid;
  const courseId = req.body.course_id;
  const orderCreationId = req.body.order_creation_id;
  const razorpayPaymentId = req.body.razorpay_payment_id;
  console.log("userId", userId);
  if (!userId || !courseId || !orderCreationId || !razorpayPaymentId) {
    return res.status(400).send("Body Data Incorrect");
  }

  // Check if course exists or not
  const courseDocRef = await db.collection("courses").doc(courseId).get();
  if (courseDocRef.exists) {
    // Check if course already purchased
    const packagesRef = db.collection("packages");
    const packagesSnapshot = await packagesRef
      .where("courseId", "==", courseId)
      .where("userId", "==", userId)
      .get();
    try {
      const currentDateTime = new Date();
      const createPackageRef = packagesRef.doc();
      const courseResData = courseDocRef.data();
      const pricingINR = courseResData.pricingINR;
      const durationInDays = courseResData?.durationInDays;
      const packageExpiryDate = new Date();
      packageExpiryDate.setUTCDate(
        packageExpiryDate.getUTCDate() + durationInDays
      );
      const utcTimeString = packageExpiryDate.toISOString();
      const newPackageBody = {
        recordId: createPackageRef.id,
        userId: userId,
        courseId: courseId,
        currentIndex: 0,
        packageExpiryDate: utcTimeString,
        packagePurchasedTime: currentDateTime.toISOString(),
        packagePurchasedPrice: pricingINR,
        orderCreationId: orderCreationId,
        razorpayPaymentId: razorpayPaymentId,
      };
      await createPackageRef.set(newPackageBody);
      res.status(200).send("Package Purchased Successfully");
    } catch (error) {
      console.log("error", error);
      res.status(500).send(error);
    }
  } else {
    return res.status(404).send("Invalid Course Id");
  }
};

const updateIndex = async (req, res) => {
  const { packageId } = req.body;

  console.log(packageId);

  if (!packageId)
    return res
      .status(400)
      .json({ error: "Bad request", message: "Package id missing" });

  try {
    const db = admin.firestore();
    const packageRef = db.collection("packages").doc(packageId);

    const FieldValue = admin.firestore.FieldValue;

    const response = await packageRef.update({
      currentIndex: FieldValue.increment(1),
    });

    return res.status(200).json({ message: "Index updated successfully!" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: error, message: "Internal server error" });
  }
};

module.exports = { getPackageById, createPackageOrder, updateIndex };
