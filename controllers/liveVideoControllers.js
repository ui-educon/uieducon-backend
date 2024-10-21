const dotenv = require("dotenv");
const { default: axios } = require("axios");
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

    console.log("WEB HOOK RECEIVED")
    console.log(req.body)
    console.log(res.body)

    res.status(200).send("OK");
}

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





module.exports = {
    liveVideoWebhook,
    instantLiveStream,
    scheduleLiveStream,
    startScheduledLiveStream,
    stopLiveStream,
    deleteWebhook,
    createWebhook
}