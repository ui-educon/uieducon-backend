const nodemailer = require("nodemailer");
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
  // const authToken = req.headers.authorization;
  // const decodedToken = await decodeAccessToken(authToken);
  const userId = req.body.uid;
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
        quizStat: {}
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






const updateIndex = async (req, res, next) => {
  const { packageId } = req.body;

  console.log(packageId);

  if (!packageId)
    return res
      .status(400)
      .json({ error: "Bad request", message: "Package id missing" });

  try {
    const db = admin.firestore();
    const packageRef = db.collection("packages").doc(packageId);
    const packageRes = (await packageRef.get()).data();
    const courseref = db.collection("courses").doc(packageRes.courseId);
    const courseRes = (await courseref.get()).data();

    if (packageRes.currentIndex < courseRes.sequence.length - 1) {
      const FieldValue = admin.firestore.FieldValue;

      const response = await packageRef.update({
        currentIndex: FieldValue.increment(1),
      });

      return res.status(200).json({ message: "Index updated successfully!" });
    } else {
      // next()
      return res.status(200).json({ message: "Course completed!!" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: error.response, message: "Internal server error" });
  }
};

const courseCompletion = async (req, res) => {
  const accessToken = req.headers.authorization;
  const decodedToken = await decodeAccessToken(accessToken);
  const uuid = decodedToken.user_id;

  try {
    const db = admin.firestore();
    const userRef = db.collection("users").doc(uuid);
    const userRes = (await userRef.get()).data();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        // TODO: replace `user` and `pass` values from <https://forwardemail.net>
        user: "uieducon23@gmail.com",
        pass: "nubr knjm hmvw xhgm",
      },
    });

    const info = await transporter.sendMail({
      from: '"Ui Educon" uieducon23@gmail.com', // sender address
      to: userRes.email, // list of receivers
      subject: "Course Completion message", // Subject line
      text: "You have successfully completed the course.", // plain text body
      html: "<b>Hello world?</b>", // html body
    });

    res
      .status(200)
      .json({ message_id: info.messageId, message: "Mail sent successfully!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error, message: "Internal server error" });
  }
};

const updateQuizStat = async (req, res) => {
  console.log(req.body)
  const db = admin.firestore();
  const userId = req.body.userId;
  const courseId = req.body.courseId;
  const totalQuestion = req.body.totalQuestion;
  const correct = req.body.correct;
  const quizId = req.body.quizId;
  const packagesRef = db.collection("packages");
  const packagesSnapshot = await packagesRef
    .where("courseId", "==", courseId)
    .where("userId", "==", userId)
    .get();

  if (packagesSnapshot.empty) {
    return res
      .status(400)
      .json({ message: "Package does not exist", error: "Bad request" });
  }

  // Get the first document from the snapshot
  const packageDoc = packagesSnapshot.docs[0];
  const packageData = packageDoc.data();
  const quizStat = packageData.quizStat || {}; // Ensure quizStat is defined

  // Update quizStat with new data
  quizStat[quizId] = { totalQuestion, correct };
  packageData.quizStat = quizStat;
  console.log("REQUEST REACH")
  console.log(quizStat)
  // Update the document in Firestore
  await packageDoc.ref.update({ quizStat });
  return res.status(200).json({ message: "Quiz stats updated successfully" });

}

module.exports = {
  getPackageById,
  createPackageOrder,
  updateIndex,
  courseCompletion,
  updateQuizStat
};
