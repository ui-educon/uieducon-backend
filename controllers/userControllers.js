const { decodeAccessToken } = require("../utils/firebase-utils");
const admin = require("firebase-admin");

const getAllPackagesPurchased = async (req, res) => {
  const accessToken = req.headers.authorization;
  const decodedToken = await decodeAccessToken(accessToken);
  const uuid = decodedToken.user_id;

  const db = admin.firestore();
  const packagesSnapshot = await db
    .collection("packages")
    .where("userId", "==", uuid)
    .get();

  const packages = [];
  packagesSnapshot.forEach((doc) => {
    const packageData = doc.data();

    // Convert the packageExpiryDate to a JavaScript Date object
    const expiryDate = new Date(packageData?.packageExpiryDate);

    // Get the current date and time
    const currentDate = new Date();

    // Compare the dates
    if (currentDate < expiryDate) {
      packages.push(packageData);
    }
  });

  res.send(packages);
};

module.exports = { getAllPackagesPurchased };
