const admin = require("firebase-admin");
const Razorpay = require("razorpay");
const { decodeAccessToken } = require("../utils/firebase-utils");

const createOrder = async (req, res) => {
  const db = admin.firestore();
  const authToken = req.headers.authorization;
  const decodedToken = await decodeAccessToken(authToken);
  const userId = decodedToken.uid
  const courseId = req.body.course_id
  if (!courseId || !userId) {
    return res.status(400).send("Course Id Required");
  }

  // Check if course exists or not
  const courseDocRef = await db.collection("courses").doc(courseId).get();
  if(courseDocRef.exists){
    // Check if course already purchased
    const packagesRef = db.collection("packages")
    const packagesSnapshot = await packagesRef.where('courseId','==',courseId).where('userId','==',userId).get();
    if(packagesSnapshot.empty){
      const courseResData = courseDocRef.data();
      const pricingINR = courseResData.pricingINR
      try {
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_SECRET,
        });

        const options = {
            amount: pricingINR*100, // amount in smallest currency unit
            currency: "INR"
        };

        const order = await instance.orders.create(options);
        if (!order) return res.status(500).send("Some error occured");
        return res.status(200).json(order);
    } catch (error) {
      console.log("error",error);
      res.status(500).send(error);
    }
    }else{
      return res.status(404).send("Course Already Purchased");
    }
  }else{
    return res.status(404).send("Invalid Course Id");
  }
};

module.exports = { createOrder };
