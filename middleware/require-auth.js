const { decodeAccessToken } = require("../utils/firebase-utils");

async function requireAuth(req, res, next) {
  try {
    const authToken = req.headers.authorization;
    const decodedToken = await decodeAccessToken(authToken);
    if (decodedToken.email) {
      next();
    } else {
      console.error("Email is not present in auth token");
      return res.status(401).send("Unauthorized");
    }
  } catch (error) {
    console.error(error);
    return res.status(401).send("Unauthorized");
  }
}

module.exports = requireAuth;