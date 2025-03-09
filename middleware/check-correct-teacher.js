const { decodeAccessToken } = require("../utils/firebase-utils");
const admin = require("firebase-admin");
async function checkCorrectTeacher(req, res, next) {
  try {
    const authToken = req.headers.authorization;
    const videoId = req.body.videoId;
    const db=admin.firestore();
    const resoucesRef = db.collection('resources');
    const resourceSnapshot = await resoucesRef
      .where("videoID", "==", videoId)
      .get();

    
    // Decode the token
    const decodedToken = await decodeAccessToken(authToken);

    if(decodedToken.superAdmin||decodedToken.manager){
        next();// proceed directly for SuperAdmin or Manager
    }
    
    // Check if email exists and custom claim 'admin' is true
    if (decodedToken.email && (resourceSnapshot[0].teacherEmail==decodedToken.email)) {
      next(); // Proceed if the user is authenticated and has the admin claim
    } else {
      console.error("Unauthorized Access");
      return res.status(403).send("Forbidden"); // Return 403 if custom claim is missing
    }
  } catch (error) {
    console.error("Error in token verification:", error);
    return res.status(401).send("Unauthorized"); // Return 401 if token is invalid
  }
}

module.exports = checkCorrectTeacher;
