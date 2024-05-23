const admin = require("firebase-admin"); // Install with: npm install firebase-admin

const {
  ResearchMethodologies,
  ResearchMethodologiesCourse,
  MLDL,
  MLDLCourse,
} = require("../seed/resourcesData");

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

// pushElementsToFirestore(elements)
//   .then((recordIds) => {
//     console.log("Record IDs:", recordIds);
//     return recordIds;
//   })
//   .catch((error) => {
//     console.error("Error pushing elements:", error);
//     return error;
//   });

const pushResources = async (req, res) => {
  try {
    // const response = await pushElementsToFirestore(MLDLCourse, "courses");
    // res.status(200).json({ data: response });
    res.send("Exit with 0 operations");
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

module.exports = {
  pushResources,
};
