const { decodeAccessToken } = require("../utils/firebase-utils");

async function checkManager(req, res, next) {
  try {
    const authToken = req.headers.authorization;
    
    // Decode the token
    const decodedToken = await decodeAccessToken(authToken);
    
    // Check if email exists and custom claim 'admin' is true
    if (decodedToken.email && (decodedToken.superAdmin||decodedToken.manager)) {
      req.body.decodedUserId=decodedToken.user_id;
      req.body.decodedEmail= decodedToken.email;
      if(decodedToken.superAdmin){
        req.body.superAdmin = true;
      }
      if(decodedToken.manager){
        req.body.manager = true;
      }
      next(); // Proceed if the user is authenticated and has the admin claim
    } else {
      console.error("Unauthorized: Custom claim 'Manager' is missing");
      return res.status(403).send("Forbidden"); // Return 403 if custom claim is missing
    }
  } catch (error) {
    console.error("Error in token verification:", error);
    return res.status(401).send("Unauthorized"); // Return 401 if token is invalid
  }
}

module.exports = checkManager;
