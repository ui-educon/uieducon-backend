const { decodeAccessToken } = require("../utils/firebase-utils");

async function checkTeacher(req, res, next) {
  try {
    const authToken = req.headers.authorization;
    
    // Decode the token
    const decodedToken = await decodeAccessToken(authToken);
    
    // Check if email exists and custom claim 'admin' is true
    if (decodedToken.email && (decodedToken.superAdmin||decodedToken.teacher||decodedToken.manager)) {
      next(); // Proceed if the user is authenticated and has the admin claim
    } else {
      console.error("Unauthorized: Custom claim 'Teacher' is missing");
      return res.status(403).send("Forbidden"); // Return 403 if custom claim is missing
    }
  } catch (error) {
    console.error("Error in token verification:", error);
    return res.status(401).send("Unauthorized"); // Return 401 if token is invalid
  }
}

module.exports = checkTeacher;
