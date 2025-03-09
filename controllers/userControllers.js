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
const getAllUsers= async(req, res)=>{
  const db = admin.firestore();
  db.collection("users")
    .get()
    .then((snapshot) => {
      const users = [];
      snapshot.forEach((doc) => {
        users.push(doc.data());
      });
      res.status(200).json(users);
    })
    .catch((error) => {
      console.error("Error getting users", error);
      res.status(500).send("Internal Server Error");
    });
}

module.exports = { getAllPackagesPurchased, getAllUsers };
