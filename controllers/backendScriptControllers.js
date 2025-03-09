const admin = require("firebase-admin"); // Install with: npm install firebase-admin
const {
  liveVideoWebhook,
  instantLiveStream,
  scheduleLiveStream,
  startScheduledLiveStream,
  stopLiveStream,
  deleteWebhook,
  createWebhook
} = require("./liveVideoControllers");
const axios = require('axios');
const {
  users,
  newCourses,
  MLDL_module3,
  quizQuestion
} = require("../seed/resourcesData");
const { FieldValue } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
const { changeFolderOfUploadedVideo } = require("./contentDataControllers");
const { createPackageOrder } = require("./packageControllers");

// Function to push an array of resource elements to Firestore in batch
async function pushResourcesToFirestore(elements, collection, teacherEmail) {
  const firestore = admin.firestore();
  const recordIds = [];
  const batch = firestore.batch();
  const collectionRef = firestore.collection(collection); // Replace with your collection name

  for (const element of elements) {
    let response;
    if (element.type == "quiz") {
      // Process quiz separately
      const quiz = {
        title: element.title || "Default Quiz Title",  // Quiz title
        questions: element.quizData,  // Array of questions
        createdAt: admin.firestore.Timestamp.now()  // Timestamp for record creation
      };

      response = await pushQuizToFirestore(quiz, "quizzes");
      // Save minimal quiz reference for courses collection
      const finalData = {
        recordId: response,      // The quiz document ID from quizzes collection
        title: element.title,    // Quiz title
        type: "quiz"
      };
      recordIds.push(finalData);
    } else {
      // For liveVideo elements, schedule the live stream first
      if (element.type == "liveVideo") {
        const mockRes = {
          status: (statusCode) => ({
            json: (data) => {
              // console.log(`Status: ${statusCode}, Response:`, data);
              response = data;  // Capture the data here
            }
          })
        };
        const responseData = await scheduleLiveStream({ body: element }, mockRes);
        // console.log(responseData);
        // Update the videoID if needed
        element.videoID = response.id;
        element.rtmp_url = ""
        element.stream_key = ""
        element.chat_embed_url = ""
      }
      if (element.videoID) {
        await changeFolderOfUploadedVideo({ body: { videoId: element.videoID, email: teacherEmail } },
          {
            status: function (statusCode) {
              // console.log(`Status: ${statusCode}`);
              return this;  // Allow chaining like res.status().json()  THIS IS MOCK RES
            },
            json: function (data) {
              // console.log('Response:', data);
            }
          }
        )
      }
      // Check if a resource with the same videoID already exists
      const query = collectionRef.where("videoID", "==", element.videoID);
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
        // For non-quiz items, return the entire element as stored
        recordIds.push(element);
      } catch (error) {
        console.error("Error processing element:", error);
        recordIds.push(null); // Mark error with null in array
      }
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

// Firestore function to add quiz data and update with the generated ID and type
async function pushQuizToFirestore(data, collection) {
  const firestore = admin.firestore();
  const collectionRef = firestore.collection(collection);  // Quizzes collection

  try {
    // Add the document without the ID first
    const docRef = await collectionRef.add(data);  // Firestore generates the document ID
    console.log("Quiz successfully added with ID:", docRef.id);

    // Update the document to store the generated ID and the type ("quiz") within it
    await docRef.update({
      recordId: docRef.id,  // Store the generated document ID inside the document
      type: "quiz"          // Set the type field for the quiz
    });

    return docRef.id;
  } catch (error) {
    console.error("Error adding quiz:", error);
    throw new Error(error);
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

// ----------------------------------------------------------------------
// Implemented createCourse function
// This function expects a course object to be provided in req.body.course,
// which includes a 'sequence' array.
// It pushes the sequence items to the "resources" collection,
// sets the totalContent as the length of the sequence,
// and then pushes the complete course object to the "courses" collection.
const createCourse = async (req, res) => {
  try {
    const course = req.body.course; // Expecting a course object in the request body
    if (!course || !course.sequence) {
      return res.status(400).json({ error: "Course data or sequence missing." });
    }

    // First, push each sequence element to the "resources" collection.
    const resourcesResponse = await pushResourcesToFirestore(course.sequence, "resources", req.body.decodedEmail);
    // Update the course sequence with the minimal resource references
    course.sequence = resourcesResponse;

    // Set totalContent to the length of the sequence
    course.totalContent = course.sequence.length;
    // Ensure recordId is empty (or as per your logic)
    course.recordId = course.recordId || "";
    course.isApproved = false;
    course.isRejected = false;
    course.approvedBy = "";
    course.pricingINR = course.pricing;
    course.pricingDollar = "";
    course.durationInDays = 365;
    course.teacherId = req.body.decodedUserId;
    // course.introductoryVideoId = 

    // Now, push the complete course object to the "courses" collection.
    // We wrap the course in an array since pushElementsToFirestore expects an array.
    const courseResponse = await pushElementsToFirestore([course], "courses");

    // console.log("THIS IS COURSE RESPONSE: ", courseResponse)

    const firestore = admin.firestore();
    const recordIds = [];
    const batch = firestore.batch();
    const usersCollectionRef = firestore.collection("users");


    const snapshot = await usersCollectionRef.where("type", "==","superAdmin").get();
    if (snapshot.empty) {
      console.log("Admin or Manager not found in Firestore");
    }

    snapshot.forEach(async (doc) => {
      console.log(doc.id)
      const mockReq = {
        body: {
          uid: doc.id,
          course_id: courseResponse[0],
          order_creation_id: "Default Creation For SuperAdmin",
          razorpay_payment_id: "Automatic Creation",
        },
      };

      // Mock res object to handle responses
      const mockRes = {
        status: (statusCode) => ({
          send: (message) => console.log(`Status: ${statusCode}, Message: ${message}`),
        }),
      };

      await createPackageOrder(mockReq, mockRes)
    });

    const mappingCollectionRef = firestore.collection("mapping");
    const mappingSnapshot = await mappingCollectionRef.where("teacherIds", "array-contains", req.body.decodedUserId).get();

    mappingSnapshot.forEach(async (doc) => {
      console.log(doc.id)
      const mockReq = {
        body: {
          uid: doc.data().managerId,
          course_id: courseResponse[0],
          order_creation_id: "Default Creation For Manager",
          razorpay_payment_id: "Automatic Creation",
        },
      };

      // Mock res object to handle responses
      const mockRes = {
        status: (statusCode) => ({
          send: (message) => console.log(`Status: ${statusCode}, Message: ${message}`),
        }),
      };

      await createPackageOrder(mockReq, mockRes)
    })
    // const docRef = snapshot.docs[0].ref;
    // await docRef.update({ type: "superAdmin" });
    await changeFolderOfUploadedVideo({ body: { videoId: course.introductoryVideoId, email: req.body.decodedEmail } },
      {
        status: function (statusCode) {
          // console.log(`Status: ${statusCode}`);
          return this;  // Allow chaining like res.status().json()  THIS IS MOCK RES
        },
        json: function (data) {
          // console.log('Response:', data);
        }
      }
    )


    return res.status(200).json({
      message: "Course created successfully.",
      resources: resourcesResponse,
      course: courseResponse,
    });
  } catch (error) {
    console.error("Error in createCourse:", error);
    return res.status(500).json({ error: error.message });
  }
};


const pushResourcesReq = async (req, res) => {
  try {
    // const response = await pushResourcesToFirestore(users, "users");
    // const response = await pushResourcesToFirestore(MLDL_module3, "resources");
    const response = await pushResourcesToFirestore(req.body.sequence, "resources");
    // const await pushElementsToFirestore(req.body.sequence, "courses");

    return res.status(200).json({ data: response });
    res.send("Exit with 0 operations");
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

const pushResources = async (req, res) => {
  try {
    const response = await pushResourcesToFirestore(MLDL_module3, "resources");
    // const response = await pushElementsToFirestore(newCourses, "courses");

    // return res.status(200).json({ data: response });
    res.send("Exit with 0 operations");
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

const createPackages = async (req, res) => {
  try {
    // console.log("REACHED REQ")
    const response = await getUserIdsByEmail(users);
    // console.log(response)
    const firestore = admin.firestore();
    const courseid = "nN57HNXHzeYdhVDptJQe";


    const courseDocRef = await firestore
      .collection("courses")
      .doc(courseid)
      .get();
    // console.log(courseDocRef)
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
    const packages = await pushElementsToFirestore(elements, "packages");
    return res.status(200).json({
      data: {
        users: response,
        packages: packages,
      },
    });
    res.send("Exit with 0 operations");
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

const updateSequence = async (req, res) => {
  const firestore = admin.firestore();
  const courseid = "nN57HNXHzeYdhVDptJQe";

  const courseDocRef = await firestore.collection("courses").doc(courseid);
  const getCourse = await courseDocRef.get();

  if (!getCourse.exists) {
    return res
      .status(400)
      .json({ message: "Course does not exist", error: "Bad request" });
  }

  try {
    const update = {};
    //THIS IS TO UPDATE THE SEQUENCE OF OLD DS (DISCARDED)

    // update["sequence"] = FieldValue.arrayUnion(...pythonDataScience_module3Seq);
    // await courseDocRef.update(update);
    // return res
    //   .status(200)
    //   .json({ message: "sequence updated!!", data: update.sequence });

    //UPDATING THE DS OF SEQUENCE ARRAY IN COURSES COLLECTION 

    // const existingCourseData = getCourse.data();
    // const existingSequence = existingCourseData.sequence || [];
    // Transform each element in the existing sequence array
    // const updatedSequence = existingSequence.map((item) => ({
    //   type: "video",  
    //   recordId: item 
    // }));
    // Update the Firestore document with the new array
    // await courseDocRef.update({ sequence: updatedSequence });
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

const pushQuiz = async (req, res) => {
  try {
    // Assuming `quizQuestion` is the array of objects (questions) coming from the request body
    const quiz = {
      title: quizQuestion.title || "Default Quiz Title",  // Quiz title
      questions: quizQuestion.quizData,  // Array of questions
      createdAt: admin.firestore.Timestamp.now()  // Timestamp for record creation
    };

    // Function to store the document
    const response = await pushQuizToFirestore(quiz, "quizzes");

    return res.status(200).json({ data: response });
  } catch (error) {
    console.log("Error adding quiz:", error);
    res.status(500).json({ error: error.message });
  }
};

const createFolder = async (req) => {

  const firestore = admin.firestore();
  const folderIdCollectionRef = firestore.collection("folderIds");
  console.log("EMAIL: ",req.body.email)
  const snapshot = await folderIdCollectionRef.where("email", "==", req.body.email).get();
  if (snapshot.empty) {

    try {
      const response = await axios({
        baseURL: "https://app.tpstreams.com",
        method: "post",
        url: `/api/v1/${process.env.ORG_CODE}/assets/folders/`,
        data: {
          title: req.body.email,
        },
        headers: {
          Authorization: `Token ${process.env.TP_AUTH_TOKEN}`,
        },
      });

      await folderIdCollectionRef.add({
        email: req.body.email,
        folderID: response.data.uuid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return response.data;
      // console.log("RESPONSE FROM TPSTREAMS:", response.data)


    } catch (error) {
      console.log("The Folder Name Already Exists or no tile provided",error)
      // console.error("Error creating folder:", error);
      // throw new Error("Failed to create folder: " + error.message);
    }
  }

};


async function setTypeSuperAdmin(email) {
  const user = await getAuth().getUserByEmail(email);
  if (!user.emailVerified) {
    throw new Error("User's email is not verified");
  }

  await getAuth().setCustomUserClaims(user.uid, {
    superAdmin: true,
    manager: false,
    teacher: false
  });

  const firestore = admin.firestore();
  const usersCollectionRef = firestore.collection("users");
  const snapshot = await usersCollectionRef.where("email", "==", email).get();
  if (snapshot.empty) {
    throw new Error("User not found in Firestore");
  }

  const docRef = snapshot.docs[0].ref;
  await docRef.update({ type: "superAdmin" });
}


async function setTypeManager(email) {
  const user = await getAuth().getUserByEmail(email);
  if (!user.emailVerified) {
    throw new Error("User's email is not verified");
  }

  await getAuth().setCustomUserClaims(user.uid, {
    superAdmin: false,
    manager: true,
    teacher: false
  });

  const firestore = admin.firestore();
  const usersCollectionRef = firestore.collection("users");
  const snapshot = await usersCollectionRef.where("email", "==", email).get();
  if (snapshot.empty) {
    throw new Error("User not found in Firestore");
  }

  const docRef = snapshot.docs[0].ref;
  await docRef.update({ type: "manager" });
}

async function setTypeTeacher(email) {
  const user = await getAuth().getUserByEmail(email);
  if (!user.emailVerified) {
    throw new Error("User's email is not verified");
  }

  await getAuth().setCustomUserClaims(user.uid, {
    superAdmin: false,
    manager: false,
    teacher: true
  });

  const firestore = admin.firestore();
  const usersCollectionRef = firestore.collection("users");
  const snapshot = await usersCollectionRef.where("email", "==", email).get();
  if (snapshot.empty) {
    throw new Error("User not found in Firestore");
  }

  const docRef = snapshot.docs[0].ref;
  await docRef.update({ type: "teacher" });
}
async function setTypeUser(email) {
  const user = await getAuth().getUserByEmail(email);
  if (!user.emailVerified) {
    throw new Error("User's email is not verified");
  }

  await getAuth().setCustomUserClaims(user.uid, {
    user: true,
  });

  const firestore = admin.firestore();
  const usersCollectionRef = firestore.collection("users");
  const snapshot = await usersCollectionRef.where("email", "==", email).get();
  if (snapshot.empty) {
    throw new Error("User not found in Firestore");
  }

  const docRef = snapshot.docs[0].ref;
  await docRef.update({ type: "user" });
}

// Function to set the user type based on the request body
const setType = async (req, res) => {
  const { email, type } = req.body;
  try {
    if (type === "superAdmin") {
      await setTypeSuperAdmin(email);
    } else if (type === "manager") {
      await setTypeManager(email);
    } else if (type === "teacher") {
      await setTypeTeacher(email);
    } else {
      await setTypeUser(email);
    }

    await createFolder(req);
    res.status(200).json({ message: "Successfully Updated" });
  } catch (error) {
    console.error("Error in setType:", error);
    res.status(500).json({ error: error.message });
  }
};
function deleteAsset(assedId){
    fetch(`https://app.tpstreams.com/api/v1/abyb62/assets/${assedId}/`, 
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json' ,
          'Authorization':`Token ${process.env.TP_AUTH_TOKEN}`
        },
      }
      
    )

}
module.exports = {
  pushResources,
  createPackages,
  updateSequence,
  getData,
  pushQuiz,
  setType,
  pushResourcesReq,
  createCourse,
  deleteAsset
};
