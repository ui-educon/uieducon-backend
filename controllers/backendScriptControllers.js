const admin = require("firebase-admin"); // Install with: npm install firebase-admin

const {
  ResearchMethodologies,
  ResearchMethodologiesCourse,
  MLDL,
  MLDLCourse,
  PythonDataScienceCourse,
  users,
  pythonDataScience_module1,
  pythonDataScience_module1Seq,
  MLDL_module1,
  MTDL_module1Seq,
  IoT_module1,
  cloud_module1,
  IOT_CLoud_Course,
  MLDL_EMAIL_LIST_FINAL_user,
  PythonDataScience_EMAIL_LIST_FINAL_1,
  PythonDataScience_EMAIL_LIST_FINAL_2,
  IOT_FINAL_EMAIL_LIST,
  Cloud_FINAL_EMAIL_LIST,
  cloud_module2,
  IoT_module2,
  pythonDataScience_module2,
  MLDL_module2,
  cloud_module1Seq,
  cloud_module2Seq,
  IoT_module2Seq,
  MLDL_module2Seq,
  pythonDataScience_module2Seq,
  pythonDataScience_module3,
  pythonDataScience_module3Seq,
  MLDL_module3,
} = require("../seed/resourcesData");
const { FieldValue } = require("firebase-admin/firestore");

async function pushResourcesToFirestore(elements, collection) {
  const firestore = admin.firestore();
  const recordIds = [];
  const batch = firestore.batch();
  const collectionRef = firestore.collection(collection); // Replace with your collection name

  for (const element of elements) {
    const query = collectionRef.where("videoID", "==", element.videoID); // Check for existing element
    try {
      const snapshot = await query.get();
      let docRef;

      if (snapshot.empty) {
        // Create new document if not found
        docRef = collectionRef.doc();
        element.recordId = docRef.id;
        batch.set(docRef, element);
      } else {
        // Use existing document ID if found
        docRef = snapshot.docs[0].ref;
        element.recordId = docRef.id;
      }

      recordIds.push(element.recordId);
    } catch (error) {
      console.error("Error processing element:", error);
      recordIds.push(null); // Mark error with null in array
    }
  }

  try {
    await batch.commit();
    console.log("Elements successfully added to Firestore.");
    console.log(recordIds);
    return recordIds;
  } catch (error) {
    console.error("Error adding elements:", error);
    return []; // Return empty array on error
  }
}

async function pushElementsToFirestore(elements, collection) {
  const firestore = admin.firestore();
  const recordIds = [];
  const batch = firestore.batch();
  const collectionRef = firestore.collection(collection); // Replace with your collection name

  for (const element of elements) {
    const docRef = collectionRef.doc();
    element.recordId = docRef.id; // Add recordId to the element
    batch.set(docRef, element);
    recordIds.push(docRef.id);
  }

  try {
    await batch.commit();
    console.log("Elements successfully added to Firestore.");
    console.log(recordIds);
    return recordIds;
  } catch (error) {
    console.error("Error adding elements:", error);
    return []; // Return empty array on error
  }
}

async function getUserIdsByEmail(emailIds) {
  const firestore = admin.firestore();

  if (!emailIds || !emailIds.length) {
    return []; // Handle empty array case
  }

  const userIds = {}; // Store email-to-userId mapping

  // Create a query to efficiently fetch documents by email (avoid full collection scan)
  const usersRef = firestore.collection("users"); // Replace with your user collection name
  const query = usersRef.where("email", "in", emailIds);

  try {
    const snapshot = await query.get();
    snapshot.forEach((doc) => {
      userIds[doc.data().email] = doc.id; // Map email to userId
    });
    return Object.values(userIds); // Return array of userIds
  } catch (error) {
    console.error("Error fetching users:", error);
    return []; // Return empty array on error
  }
}

const pushResources = async (req, res) => {
  try {
    // const response = await pushResourcesToFirestore(MLDL_module3, "resources");
    // const response = await pushElementsToFirestore(IOT_CLoud_Course, "courses");
    // res.status(200).json({ data: response });
    res.send("Exit with 0 operations");
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

const createPackages = async (req, res) => {
  try {
    const response = await getUserIdsByEmail(users);
    const firestore = admin.firestore();
    const courseid = "nikJwaNsnFi10CioZBcR";

    const courseDocRef = await firestore
      .collection("courses")
      .doc(courseid)
      .get();

    if (!courseDocRef.exists) {
      res
        .status(400)
        .json({ message: "Course does not exist", error: "Bad request" });
    }
    const courseResData = courseDocRef.data();
    const pricingINR = courseResData.pricingINR;
    const durationInDays = courseResData?.durationInDays;
    const packageExpiryDate = new Date();
    packageExpiryDate.setUTCDate(
      packageExpiryDate.getUTCDate() + durationInDays
    );
    const utcTimeString = packageExpiryDate.toISOString();
    const currentDateTime = new Date();
    const elements = [];
    for (const userid of response) {
      const element = {
        userId: userid,
        courseId: courseid,
        currentIndex: 0,
        packageExpiryDate: utcTimeString,
        packagePurchasedTime: currentDateTime.toISOString(),
        packagePurchasedPrice: pricingINR,
        orderCreationId: "generated_by_script",
        razorpayPaymentId: "generated_by_script",
      };

      elements.push(element);
    }

    // const packages = await pushElementsToFirestore(elements, "packages");

    // res.status(200).json({
    //   data: {
    //     users: response,
    //     packages: packages,
    //   },
    // });
    res.send("Exit with 0 operations");
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

const updateSequence = async (req, res) => {
  const firestore = admin.firestore();
  const courseid = "V8JOVcbMksF7lbYOZTx9";

  const courseDocRef = await firestore.collection("courses").doc(courseid);
  const getCourse = await courseDocRef.get();

  if (!getCourse.exists) {
    return res
      .status(400)
      .json({ message: "Course does not exist", error: "Bad request" });
  }

  try {
    const update = {};
    // update["sequence"] = FieldValue.arrayUnion(...pythonDataScience_module3Seq);
    // await courseDocRef.update(update);
    // return res
    //   .status(200)
    //   .json({ message: "sequence updated!!", data: update.sequence });
    res.send("Exit with 0 operations");
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

async function getStat() {
  const firestore = admin.firestore();

  const nameCounts = [];
  const elementsRef = firestore.collection("packages");

  try {
    const elementsSnapshot = await elementsRef.get();

    // Process each element document
    for (const elementDoc of elementsSnapshot.docs) {
      const userId = elementDoc.data().userId; // Replace with the field holding userId
      const count = elementDoc.data().currentIndex || 0; // Replace with the field holding count (default 0)

      // Get the user document
      const userDoc = await firestore.collection("users").doc(userId).get();

      if (userDoc.exists) {
        const name = userDoc.data().name;
        nameCounts.push({ name, videosWatched: count + 1 }); // Add 1 to count
      } else {
        console.warn("User not found for userId:", userId);
      }
    }

    return nameCounts;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}

const getData = async (req, res) => {
  try {
    const response = await getStat();
    return res.status(200).json({ data: response });
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};

module.exports = {
  pushResources,
  createPackages,
  updateSequence,
  getData,
};
