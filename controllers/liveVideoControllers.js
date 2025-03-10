const dotenv = require("dotenv");
const admin = require("firebase-admin");
const { default: axios } = require("axios");
const { getMessaging } = require("firebase-admin/messaging");
const { response } = require("express");
const { changeFolderOfUploadedVideo } = require("./contentDataControllers");
const ACTIVE_STREAMS = new Map();

dotenv.config();

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


    //SAMPLE RESPONSES ON WEBHOOK

    // { "title" : "FINAL PHASE",
    //      "bytes": null, "type": "livestream", "video": null, "id": "647XSkBuYMN", "live_stream": { "rtmp_url": "", "stream_key": null, "status": "Not Started", "hls_url": "https://d1too2jj5wlppy.cloudfront.net/live/abyb62/647XSkBuYMN/video.m3u8", "start": "2025-01-12 00:26:00", "transcode_recorded_video": true, "enable_drm_for_recording": true, "chat_embed_url": null, "chat_transcript_url": null, "chat_room_id": null, "resolutions": ["240p", "480p", "720p"], "enable_drm": false, "enable_llhls": false, "latency": "Low Latency", "notice_message": "Hang tight! The live stream will kick off at January 12, 2025, 12:26 AM." }, "parent": null, "parent_id": null, "drm_content_id": null }


    //      {"title": "FINAL PHASE", "bytes": null, "type": "livestream", "video": null, "id": "647XSkBuYMN", "live_stream": {"rtmp_url": "rtmp://13.127.98.101/live", "stream_key": "org-abyb62-live-647XSkBuYMN-8Np1", "status": "Not Started", "hls_url": "https://d1too2jj5wlppy.cloudfront.net/live/abyb62/647XSkBuYMN/video.m3u8", "start": "2025-01-12 00:26:00", "transcode_recorded_video": true, "enable_drm_for_recording": true, "chat_embed_url": "https://app.tpstreams.com/live-chat/abyb62/647XSkBuYMN/", "chat_transcript_url": null, "chat_room_id": "5dceb32b-5783-417e-9e3a-3cd0651f42f7", "resolutions": ["240p", "480p", "720p"], "enable_drm": false, "enable_llhls": false, "latency": "Low Latency", "notice_message": "Hang tight! The live stream will kick off at January 12, 2025, 12:26 AM."}, "parent": null, "parent_id": null, "drm_content_id": null}

    //      {"title": "FINAL PHASE", "bytes": null, "type": "livestream", "video": null, "id": "647XSkBuYMN", "live_stream": {"rtmp_url": "rtmp://13.127.98.101/live", "stream_key": "org-abyb62-live-647XSkBuYMN-8Np1", "status": "Streaming", "hls_url": "https://d1too2jj5wlppy.cloudfront.net/live/abyb62/647XSkBuYMN/video.m3u8", "start": "2025-01-12 00:26:00", "transcode_recorded_video": true, "enable_drm_for_recording": true, "chat_embed_url": "https://app.tpstreams.com/live-chat/abyb62/647XSkBuYMN/", "chat_transcript_url": null, "chat_room_id": "5dceb32b-5783-417e-9e3a-3cd0651f42f7", "resolutions": ["240p", "480p", "720p"], "enable_drm": false, "enable_llhls": false, "latency": "Low Latency", "notice_message": null}, "parent": null, "parent_id": null, "drm_content_id": null}



    //      {"title": "FINAL PHASE", "bytes": null, "type": "livestream", "video": null, "id": "647XSkBuYMN", "live_stream": {"rtmp_url": "rtmp://13.127.98.101/live", "stream_key": "org-abyb62-live-647XSkBuYMN-8Np1", "status": "Disconnected", "hls_url": "https://d1too2jj5wlppy.cloudfront.net/live/abyb62/647XSkBuYMN/video.m3u8", "start": "2025-01-12 00:26:00", "transcode_recorded_video": true, "enable_drm_for_recording": true, "chat_embed_url": "https://app.tpstreams.com/live-chat/abyb62/647XSkBuYMN/", "chat_transcript_url": null, "chat_room_id": "5dceb32b-5783-417e-9e3a-3cd0651f42f7", "resolutions": ["240p", "480p", "720p"], "enable_drm": false, "enable_llhls": false, "latency": "Low Latency", "notice_message": null}, "parent": null, "parent_id": null, "drm_content_id": null}


    //      {"title": "FINAL PHASE", "bytes": null, "type": "livestream", "video": null, "id": "647XSkBuYMN", "live_stream": {"rtmp_url": "rtmp://13.127.98.101/live", "stream_key": "org-abyb62-live-647XSkBuYMN-8Np1", "status": "Disconnected", "hls_url": "https://d1too2jj5wlppy.cloudfront.net/live/abyb62/647XSkBuYMN/video.m3u8", "start": "2025-01-12 00:26:00", "transcode_recorded_video": true, "enable_drm_for_recording": true, "chat_embed_url": "https://app.tpstreams.com/live-chat/abyb62/647XSkBuYMN/", "chat_transcript_url": null, "chat_room_id": "5dceb32b-5783-417e-9e3a-3cd0651f42f7", "resolutions": ["240p", "480p", "720p"], "enable_drm": false, "enable_llhls": false, "latency": "Low Latency", "notice_message": null}, "parent": null, "parent_id": null, "drm_content_id": null}

    //      {"title": "FINAL PHASE", "bytes": null, "type": "livestream", "video": {"progress": 0, "thumbnails": null, "status": "Transcoding", "playback_url": "https://d1too2jj5wlppy.cloudfront.net/transcoded/647XSkBuYMN/video.m3u8", "dash_url": "https://d1too2jj5wlppy.cloudfront.net/transcoded/647XSkBuYMN/video.mpd", "preview_thumbnail_url": null, "cover_thumbnail_url": null, "format": "abr", "resolutions": ["240p", "360p", "480p", "720p"], "video_codec": "h264", "audio_codec": "aac", "enable_drm": true, "tracks": [], "inputs": [{"url": "private/647XSkBuYMN/video.mp4"}], "transmux_only": null, "duration": null, "content_protection_type": "drm", "generate_subtitle": false, "video_codecs": ["h264"], "output_urls": {"h264": {"hls_url": "https://d1too2jj5wlppy.cloudfront.net/transcoded/647XSkBuYMN/video.m3u8", "dash_url": "https://d1too2jj5wlppy.cloudfront.net/transcoded/647XSkBuYMN/video.mpd"}}}, "id": "647XSkBuYMN", "live_stream": {"rtmp_url": "rtmp://13.127.98.101/live", "stream_key": "org-abyb62-live-647XSkBuYMN-8Np1", "status": "Completed", "hls_url": "https://d1too2jj5wlppy.cloudfront.net/live/abyb62/647XSkBuYMN/video.m3u8", "start": "2025-01-12 00:26:00", "transcode_recorded_video": true, "enable_drm_for_recording": true, "chat_embed_url": "https://app.tpstreams.com/live-chat/abyb62/647XSkBuYMN/", "chat_transcript_url": "https://d1too2jj5wlppy.cloudfront.net/transcoded/647XSkBuYMN/chat.json", "chat_room_id": "5dceb32b-5783-417e-9e3a-3cd0651f42f7", "resolutions": ["240p", "480p", "720p"], "enable_drm": false, "enable_llhls": false, "latency": "Low Latency", "notice_message": "The live stream has come to an end. Stay tuned, we'll have the recording ready for you shortly."}, "parent": null, "parent_id": null, "drm_content_id": "skd://1d9122a22e3a4dd0923a9de80dbbdaa5"}


//  {"title": "FINAL PHASE", "bytes": null, "type": "livestream", "video": {"progress": 0, "thumbnails": null, "status": "Completed",
//      "playback_url": "https://d1too2jj5wlppy.cloudfront.net/transcoded/647XSkBuYMN/video.m3u8",
//       "dash_url": "https://d1too2jj5wlppy.cloudfront.net/transcoded/647XSkBuYMN/video.mpd", "preview_thumbnail_url": null, 
//      "cover_thumbnail_url": null, "format": "abr", "resolutions": ["240p", "360p", "480p", "720p"], "video_codec": "h264", "audio_codec": "aac", 
//      "enable_drm": true, "tracks": [{"id": 291397, "type": "Preview Thumbnail", "name": "", "url": "https://d1too2jj5wlppy.cloudfront.net/None", "bytes": null, 
//      "language": "en", "width": null, "height": null, "duration": null, "is_active": true, "playlists": [], "subtitle_type": "Uploaded", "preview_thumbnail": 
//      {"url": "https://d1too2jj5wlppy.cloudfront.net/transcoded/647XSkBuYMN/sprite/sprite_image.png", "interval": 1, "width": 160, "height": 90, "rows": 7, "columns": 7}},
//       {"id": 291398, "type": "Playlist", "name": "", "url": "https://d1too2jj5wlppy.cloudfront.net/None", "bytes": null, "language": "en", "width": null,
//       "height": null, "duration": null, "is_active": true, "playlists": [{"name": "720p_h264_dash", "bytes": 732008, "width": 1280, "height": 720}, {"name": "720p_h264_hls", 
//      "bytes": 716940, "width": 1280, "height": 720}, {"name": "480p_h264_dash", "bytes": 730991, "width": 854, "height": 480}, {"name": "480p_h264_hls", "bytes": 715883, "width": 854, "height": 480}, {"name": "360p_h264_dash", "bytes": 456811, "width": 640, "height": 360}, {"name": "360p_h264_hls", "bytes": 441740, 
//      "width": 640, "height": 360}, {"name": "240p_h264_dash", "bytes": 456596, "width": 426, "height": 240}, {"name": "240p_h264_hls", "bytes": 441503, "width": 426,
//       "height": 240}], "subtitle_type": "Uploaded", "preview_thumbnail": null}], "inputs": [{"url": "private/647XSkBuYMN/video.mp4"}], "transmux_only": null,
//       "duration": 48, "content_protection_type": "drm", "generate_subtitle": false, "video_codecs": ["h264"], "output_urls": {"h264": {"hls_url": "https://d1too2jj5wlppy.cloudfront.net/transcoded/647XSkBuYMN/video.m3u8", "dash_url": "https://d1too2jj5wlppy.cloudfront.net/transcoded/647XSkBuYMN/video.mpd"}}}, 
//      "id": "647XSkBuYMN", "live_stream": {"rtmp_url": "rtmp://13.127.98.101/live", "stream_key": "org-abyb62-live-647XSkBuYMN-8Np1", "status": "Completed",
//       "hls_url": "https://d1too2jj5wlppy.cloudfront.net/live/abyb62/647XSkBuYMN/video.m3u8", "start": "2025-01-12 00:26:00", "transcode_recorded_video": true, 
//      "enable_drm_for_recording": true, "chat_embed_url": "https://app.tpstreams.com/live-chat/abyb62/647XSkBuYMN/",
//       "chat_transcript_url": "https://d1too2jj5wlppy.cloudfront.net/transcoded/647XSkBuYMN/chat.json", "chat_room_id": "5dceb32b-5783-417e-9e3a-3cd0651f42f7", "resolutions": ["240p", "480p", "720p"], 
//      "enable_drm": false, "enable_llhls": false, "latency": "Low Latency", "notice_message": null}, "parent": null, "parent_id": null, "drm_content_id": "skd://1d9122a22e3a4dd0923a9de80dbbdaa5"}
    try {
        const firestore = admin.firestore();
        const resourcesRef = firestore.collection("resources");

        console.log("RESOURCEREF", resourcesRef)
        const videoId = req.body.id;
        if (req.body.live_stream?.status === 'Stopped') {


            //Changing Folder Of Video to The Teacher's Email
            // const FolderIdsRef = firestore.collection("folderIds");

            const resourceSnap = await resourcesRef.where("videoID", "==", videoId).get();
            const email = resourceSnap.docs[0].data().teacherEmail;
            console.log("RESOURCESNAP", resourceSnap.docs[0])
            // Check if the user exists in the Firestore collection
            // const snapshot = await FolderIdsRef.where("email", "==", email).get();
            if(resourceSnap.empty){
                return res.status(400).json({ message: "Resource Snap Empty not found in Firestore" });
            }
            await resourceSnap.docs[0].ref.update({ type: "video" })  //changing type of resource for liveVideo to video
            // if (snapshot.empty) {
            //     // User not found in Firestore
            //     return res.status(400).json({ message: "User not found in Firestore" });
            // } else {
            //     const doc = snapshot.docs[0]; // Get the first document
            //     const folderID = doc.data().folderID; // Access the folderID field

            //     // Return the folderID
            //     res.status(200).json({ folderID });
            //     const response = await axios({
            //         baseURL: "https://app.tpstreams.com",
            //         method: "post",
            //         url: `/api/v1/${process.env.ORG_CODE}/assets/${videoId}/move/`,
            //         data: {
            //             parent: folderID,
            //         },
            //         headers: {
            //             Authorization: `Token ${process.env.TP_AUTH_TOKEN}`,
            //         },
            //     });
            //     ACTIVE_STREAMS.delete(videoId);
            // }
        }

        else if (req.body.live_stream?.rtmp_url && req.body.live_stream?.stream_key) {
            console.log("videoID", videoId);

            const streamId = req.body.id;
            const resourceSnap = await resourcesRef.where("videoID","==",videoId).get();
            console.log("RESOIRCE SNAP",resourceSnap.docs.length)
            await resourceSnap.docs[0].ref.update({ rtmp_url:req.body.live_stream?.rtmp_url,stream_key:req.body.live_stream?.stream_key, chat_embed_url:req.body.live_stream?.chat_embed_url })  //updating rtmp_url and stream_key and chat_embed_url
            // Get the stored SSE connection for this stream
            const clientResponse = ACTIVE_STREAMS.get(streamId);

            if (clientResponse) {
                // Prepare the data to send to client
                const streamData = {
                    rtmpUrl: req.body.live_stream.rtmp_url,
                    streamKey: req.body.live_stream.stream_key,
                    status: req.body.live_stream.status,
                    chatEmbedUrl: req.body.live_stream.chat_embed_url
                };

                // Send to client through SSE
                clientResponse.write(`data: ${JSON.stringify(streamData)}\n\n`);

                // If status is final (like 'started' or 'stopped'), close the connection
                if (req.body.live_stream.status === 'started' ||
                    req.body.live_stream.status === 'stopped') {
                    clientResponse.end();
                    ACTIVE_STREAMS.delete(streamId);
                }
            }
        }

        res.status(200).send("Webhook processed successfully");
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).send("Error processing webhook");
    }
};

const startStreamConnection = async (req, res) => {
    const streamId = req.query.id;

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Store the response object with timestamp
    ACTIVE_STREAMS.set(streamId, res);

    // Send initial status
    res.write(`data: ${JSON.stringify({ status: 'connecting' })}\n\n`);

    // Clean up on client disconnect
    req.on('close', () => {
        ACTIVE_STREAMS.delete(streamId);
    });
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
    const courseId = req.query.courseId;
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
        // try {

        //     const firestore = admin.firestore();
        //     const liveVideoRef = firestore.collection('liveVideo').doc(id);
        //     await liveVideoRef.set({ courseId: courseId })
        // } catch (error) {
        //     console.error("error adding doc,", error)
        // }


        res.status(200).json({
            id: response.data.id
            // thumbnail: response.data.video.cover_thumbnail_url,
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({ error: error });
    }
    // res.status(200).json({
    //     "title": "Data science Live class",
    //     "bytes": null,
    //     "type": "livestream",
    //     "video": null,
    //     "id": "8XGEEj6ptnB",
    //     "live_stream": {
    //         "rtmp_url": "",
    //         "stream_key": null,
    //         "status": "Not Started",
    //         "hls_url": "https://d3cydmgt9q030i.cloudfront.net/live/edee9b/8XGEEj6ptnB/video.m3u8",
    //         "start": "2024-10-05 15:30:00",
    //         "transcode_recorded_video": true,
    //         "enable_drm_for_recording": false,
    //         "chat_embed_url": "https://app.tpstreams.com/live-chat/edee9b/8XGEEj6ptnB/",
    //         "resolutions": [
    //             "240p",
    //             "480p",
    //             "720p"
    //         ]
    //     },
    //     "parent": null,
    //     "parent_id": null
    // })
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

const getUserFcmTokens = async (videoID) => {
    const firestore = admin.firestore();
    const liveVideoCollectionRef = firestore.collection('liveVideo');

    // Fetch the courseId
    const doc = await liveVideoCollectionRef.doc(videoID).get();
    let courseId;
    if (doc.exists) {
        courseId = doc.data().courseId;
    } else {
        return [];
    }

    // Query the packages collection using courseId
    const packagesRef = firestore.collection('packages');
    const query = packagesRef.where("courseId", "==", courseId);
    let userIDs = [];
    try {
        const snapshot = await query.get();
        if (!snapshot.empty) {
            userIDs = snapshot.docs.map(item => item.data().userId);
        } else {
            return [];
        }
    } catch (error) {
        console.error(error);
        return [];
    }

    // Fetch user emails for the userIDs
    const usersCollectionRef = firestore.collection('users');
    const userEmailsPromises = userIDs.map(async (userId) => {
        const userDoc = await usersCollectionRef.doc(userId).get();
        if (userDoc.exists) {
            return userDoc.data().email;
        }
        return null;
    });

    // Wait for all userEmails to resolve
    const userEmails = (await Promise.all(userEmailsPromises)).filter(email => email);

    // Fetch FCM tokens for the user emails
    const tokenCollectionRef = firestore.collection('token');
    let tokens = [];
    const tokenPromises = userEmails.map(async (email) => {
        const tokenQuery = await tokenCollectionRef.where("email", "==", email).get();
        if (!tokenQuery.empty) {
            tokenQuery.docs.forEach((doc) => {
                tokens = [...tokens, ...doc.data().token];
            });
        }
    });

    // Wait for all token queries to resolve
    await Promise.all(tokenPromises);

    return tokens;
};


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

const getLiveVideos = async (req, res) => {
    console.log("GET LIVE VIDEOS REACHED");
    try {
        const uid = req.query.user_id; // Extract the UID from the route
        console.log("UID:", uid);

        if (!uid) {
            return res.status(400).json({ error: "User ID is required." });
        }

        // Fetch user details from Firebase Auth
        const userRecord = await admin.auth().getUser(uid);
        const email = userRecord.email;

        console.log("User email:", email);

        // Query Firestore collection "resources"
        const resourcesRef = admin.firestore().collection("resources");
        const snapshot = await resourcesRef
            .where("teacherEmail", "==", email)
            .where("type", "==", "liveVideo")
            .get();

        if (snapshot.empty) {
            return res.status(404).json({ message: "No live videos found for this user." });
        }

        // Extract documents
        const liveVideos = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        res.status(200).json({ liveVideos });
    } catch (error) {
        console.error("Error fetching live videos:", error);
        res.status(500).json({ error: "Failed to fetch live videos." });
    }
};
const getAllLiveVideos = async (req, res) => {
    console.log("GET LIVE VIDEOS REACHED");
    try {


        // Query Firestore collection "resources"
        const resourcesRef = admin.firestore().collection("resources");
        const snapshot = await resourcesRef
            .where("type", "==", "liveVideo")
            .get();

        if (snapshot.empty) {
            return res.status(404).json({ message: "No live videos found" });
        }

        // Extract documents
        const liveVideos = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        res.status(200).json({ liveVideos });
    } catch (error) {
        console.error("Error fetching live videos:", error);
        res.status(500).json({ error: "Failed to fetch live videos." });
    }
};


module.exports = {
    liveVideoWebhook,
    startStreamConnection,
    instantLiveStream,
    scheduleLiveStream,
    startScheduledLiveStream,
    stopLiveStream,
    deleteWebhook,
    createWebhook,
    setFcmToken,
    getLiveVideos,
    getAllLiveVideos
    // test 
}