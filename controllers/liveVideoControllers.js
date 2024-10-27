const dotenv = require("dotenv");
const admin = require("firebase-admin");
const { default: axios } = require("axios");
const { getMessaging } = require("firebase-admin/messaging");
const { response } = require("express");

dotenv.config();

const getFcmToken = async (videoID) => {
    const firestore = admin.firestore();
    const collectionRef = firestore.collection('resources');

    const query = collectionRef.where("videoID", "==", videoID);
    try {
        const snapshot = await query.get();
        let email;

        if (snapshot.empty) {
            return []
        } else {
            email = snapshot.docs[0].data().teacherEmail;
        }
    } catch (error) {
        console.error(error);
    }
    const tokenCollectionRef = firestore.collection('token');

    const tokenQuery = collectionRef.where("email", "==", email);
    try {
        const snapshot = await tokenQuery.get();
        // let docRef;

        if (snapshot.empty) {
            return []
        } else {
            return snapshot.docs[0].data().token
        }
    } catch (error) {
        console.error(error);
    }
}


const createWebhook = async (req, res) => {
    // console.log(req.body)1
    const { url, secret_token } = req.body;

    try {
        const response = await axios({
            baseURL: "https://app.tpstreams.com",
            method: "post",
            url: `/api/v1/${process.env.ORG_CODE}/webhooks/`,
            data: {
                url,
                secret_token
            },
            headers: {
                Authorization: `Token ${process.env.TP_AUTH_TOKEN}`,
            },
        });
        console.log(response.data);

        res.status(200).json({
            id: response.data.id
            // thumbnail: response.data.video.cover_thumbnail_url,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error });
    }

};
const liveVideoWebhook = async (req, res) => {
    try {
        // Get FCM tokens associated with the teacher's ID (assumed passed in the request body)
        const tokens = await getFcmToken(req.body.id); // Ensure this function retrieves an array of tokens

        // If tokens are found, send notifications
        if (tokens.length > 0) {
            const message = {
                data: req.body, // The data you want to send as payload
            };

            // Send notification to each token
            const sendPromises = tokens.map(token => {
                return getMessaging().send({
                    ...message, // Spread the common message fields
                    token: token // Token for the current device
                });
            });

            // Wait for all notifications to be sent
            const responses = await Promise.all(sendPromises);
            console.log('Successfully sent messages:', responses);

            res.status(200).send("Notifications sent successfully.");
        } else {
            res.status(404).send("No FCM tokens found for the provided ID.");
        }
    } catch (error) {
        console.error('Error sending notifications:', error);
        res.status(500).send("Error sending notifications.");
    }
};

const deleteWebhook = async (req, res) => {
    // console.log(req.body)1
    const id = req.query.id;
    if (!id)
        return res.status(400).json({
            messsage: "Bad request",
            error: "id missing",
        });
    else {
        try {
            const response = await axios({
                baseURL: "https://app.tpstreams.com",
                method: "delete",
                url: `/api/v1/${process.env.ORG_CODE}/webhooks/${id}/`,
                headers: {
                    Authorization: `Token ${process.env.TP_AUTH_TOKEN}`,
                },
            });
            console.log(response.data);

            res.status(200).json({
                id: response.data.id
                // thumbnail: response.data.video.cover_thumbnail_url,
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: error });
        }
    }
};
const instantLiveStream = async (req, res) => {
    console.log(req.body)
    const { title } = req.body;
    if (!title)
        return res.status(400).json({
            messsage: "Bad request",
            error: "video id missing",
        });
    else {
        try {
            const response = await axios({
                baseURL: "https://app.tpstreams.com",
                method: "post",
                url: `/api/v1/${process.env.ORG_CODE}/assets/live_streams/`,
                data: {
                    "title": title,
                    "enable_drm_for_recording": true,
                    "latency": "Low Latency"
                },
                headers: {
                    Authorization: `Token ${process.env.TP_AUTH_TOKEN}`,
                },
            });
            console.log(response.data);

            res.status(200).json({
                id: response.data.id
                // thumbnail: response.data.video.cover_thumbnail_url,
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: error });
        }
    }
};
const scheduleLiveStream = async (req, res) => {
    console.log(req.body)
    const { title, time } = req.body;
    if (!title)
        return res.status(400).json({
            messsage: "Bad request",
            error: "title required",
        });
    else {
        try {
            const response = await axios({
                baseURL: "https://app.tpstreams.com",
                method: "post",
                url: `/api/v1/${process.env.ORG_CODE}/assets/live_streams/`,
                data: {
                    "title": title,
                    "start": time,
                    "enable_drm_for_recording": true,
                    "latency": "Low Latency"
                },
                headers: {
                    Authorization: `Token ${process.env.TP_AUTH_TOKEN}`,
                },
            });
            console.log(response);

            res.status(200).json({
                id: response.data.id
                // thumbnail: response.data.video.cover_thumbnail_url,
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: error });
        }
    }
};

const startScheduledLiveStream = async (req, res) => {
    console.log("REQQUEST REACHED")
    console.log(req.body)
    const id = req.query.id;
    console.log(id)
    try {
        const response = await axios({
            baseURL: "https://app.tpstreams.com",
            method: "post",
            url: `/api/v1/${process.env.ORG_CODE}/assets/${id}/start_server/`,
            headers: {
                Authorization: `Token ${process.env.TP_AUTH_TOKEN}`,
            },
        });
        console.log(response);

        res.status(200).json({
            id: response.data.id
            // thumbnail: response.data.video.cover_thumbnail_url,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error });

    }
}
const stopLiveStream = async (req, res) => {
    console.log("REQQUEST REACHED")
    console.log(req.body)
    const id = req.query.id;
    console.log(id)
    try {
        const response = await axios({
            baseURL: "https://app.tpstreams.com",
            method: "post",
            url: `/api/v1/${process.env.ORG_CODE}/assets/${id}/stop_live_stream/`,
            headers: {
                Authorization: `Token ${process.env.TP_AUTH_TOKEN}`,
            },
        });
        console.log(response);

        res.status(200).json({
            id: response.data.id
            // thumbnail: response.data.video.cover_thumbnail_url,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error });

    }
};


//FCM TOKEN TO DB

const setFcmToken = async (req, res) => {
    const email = req.body.email;
    const token = req.body.fcmToken;
    const firestore = admin.firestore();
    const collectionRef = firestore.collection('token');
    const batch = firestore.batch(); // Initialize batch

    const query = collectionRef.where("email", "==", email);
    try {
        const snapshot = await query.get();
        let docRef;

        if (snapshot.empty) {
            // New user, create a new document
            docRef = collectionRef.doc();
            batch.set(docRef, { "email": email, "token": [token] });
        } else {
            // Existing user, update their token list
            docRef = snapshot.docs[0].ref;
            const storedTokens = snapshot.docs[0].data().token || [];

            if (!storedTokens.includes(token)) {
                batch.update(docRef, { "token": [...storedTokens, token] });
            }
        }

        // Commit the batch operations
        await batch.commit();

        // Respond with success
        res.status(200).send({ success: true, message: "Token stored/updated successfully" });

    } catch (error) {
        console.error("Error Adding FCM Token: ", error);
        res.status(500).send({ success: false, message: "Error storing token" });
    }
};



module.exports = {
    liveVideoWebhook,
    instantLiveStream,
    scheduleLiveStream,
    startScheduledLiveStream,
    stopLiveStream,
    deleteWebhook,
    createWebhook,
    setFcmToken
}