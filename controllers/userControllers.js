const { decodeAccessToken } = require("../utils/firebase-utils");
const admin = require("firebase-admin");

const getAllPackagesPurchased = async (req, res) => {
  const accessToken = req.headers.authorization;
  const decodedToken = await decodeAccessToken(accessToken);
  const uuid = decodedToken.user_id;

  const db = admin.firestore();
  const packagesSnapshot = await db.collection("packages").where("userId", "==", uuid).get();

  const packages = [];
  packagesSnapshot.forEach(doc => {
    packages.push(doc.data());
  });

  res.send(packages);
}

module.exports = { getAllPackagesPurchased }