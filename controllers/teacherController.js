const admin = require("firebase-admin");
const { decodeAccessToken } = require("../utils/firebase-utils");

const getUnapprovedCourses = async (req, res) => {
  try {
    const { decodedUserId, decodedEmail } = req.body;

    console.log("REQ REACHED FOR UNAPPROVED");

    const authToken = req.headers.authorization;
    if (!authToken) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    // Decode the token
    const decodedToken = await decodeAccessToken(authToken);
    console.log("Decoded Token:", decodedToken);

    if (!decodedToken || !decodedToken.email) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    const db = admin.firestore();
    const coursesCollectionRef = db.collection("courses");
    let unapprovedCoursesQuery;
    // Query for unapproved courses by the teacher
    if (req.body.teacher) {
      unapprovedCoursesQuery = coursesCollectionRef
        .where("teacherId", "==", decodedUserId)
        .where("isApproved", "==", false);
    }
    else if (req.body.manager) {
      console.log("THIS IS MANAGER");
      const mappingCollectionRef = db.collection("mapping");
      const mappingSnapshot = await mappingCollectionRef.where("managerId", "==", decodedUserId).get();
      let teacherIds = [];
// console.log("This is Data:",mappingSnapshot.docs[0].data())
      if (!mappingSnapshot.empty) {
        const mappingData = mappingSnapshot.docs[0].data();
        console.log(mappingData)
        teacherIds = mappingData.teacherIds || [];
      }

      if (teacherIds.length > 0) {
        unapprovedCoursesQuery = coursesCollectionRef
          .where("teacherId", "in", teacherIds)
          .where("isApproved", "==", false);
      } else {
        console.log("No teacher IDs found for this manager.");
        return res.status(200).json([]); // Return early if no teacher IDs
      }
    }


    else if (req.body.superAdmin) {
      console.log("THIS IS SUPERADMIN")
      unapprovedCoursesQuery = coursesCollectionRef.where("isApproved", "==", false);
    }


    const snapshot = await unapprovedCoursesQuery.get();

    if (snapshot.empty) {
      console.log("No unapproved courses found");
      return res.status(200).json([]);
    }

    // Extract course data
    const unapprovedCourses = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // console.log("Unapproved Courses:", unapprovedCourses);
    return res.status(200).json(unapprovedCourses);

  } catch (err) {
    console.error("Error fetching unapproved courses:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const mapManagerTeacher = async (req, res) => {
  try {
    console.log("REQ REACHED FOR mapManagerTeacher");
    const authToken = req.headers.authorization;
    if (!authToken) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    const managerEmail = req.body.managerEmail;
    const teacherEmails = [...new Set(req.body.teacherEmails)]; // Remove duplicate emails

    const db = admin.firestore();
    const batch = db.batch();
    const mappingCollectionRef = db.collection("mapping");
    const userCollectionRef = db.collection("users");

    // Get Manager ID
    const managerSnapshot = await userCollectionRef.where("email", "==", managerEmail).where("type", "==", "manager").get();

    if (managerSnapshot.empty) {
      console.log(`No Manager with Email: ${managerEmail} found`);
      return res.status(500).json({ "error": "No Manager with given email exists" });
    }

    const managerId = managerSnapshot.docs[0].id;

    let failedEmails = [];
    let successEmails = [];
    let teacherIds = [];

    // Use for...of with await inside loop
    for (const email of teacherEmails) {
      const teacherSnapshot = await userCollectionRef.where("email", "==", email).where("type", "==", "teacher").get();
      if (teacherSnapshot.empty) {
        failedEmails.push(email);
      } else {
        const teacherId = teacherSnapshot.docs[0].id;
        teacherIds.push(teacherId);
        successEmails.push(email);
      }
    }

    // Check if mapping already exists
    const mappingSnapshot = await mappingCollectionRef.where("managerId", "==", managerId).get();
    let docRef;

    if (mappingSnapshot.empty) {
      // Create new document if not found
      docRef = mappingCollectionRef.doc();
      batch.set(docRef, { managerId, teacherIds });
    } else {
      // Use existing document
      docRef = mappingSnapshot.docs[0].ref;
      const existingData = mappingSnapshot.docs[0].data();
      const existingTeacherIds = existingData.teacherIds || [];
      const updatedTeacherIds = Array.from(new Set([...existingTeacherIds, ...teacherIds])); // Avoid duplicates
      batch.update(docRef, { teacherIds: updatedTeacherIds });
    }

    await batch.commit();

    console.log("Mapping successfully updated.");
    return res.status(200).json({ successEmails, failedEmails });

  } catch (err) {
    console.error("Error mapping manager to teachers:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};




module.exports = {
  getUnapprovedCourses,
  mapManagerTeacher
};
