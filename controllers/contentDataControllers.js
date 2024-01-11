const { Vimeo } = require("vimeo");
const dotenv = require("dotenv");
const { google } = require("googleapis");

dotenv.config();

const getVideoData = async (req, res) => {
  const { link } = req.query;

  if (!link)
    return res
      .status(400)
      .json({ error: "Bad Request", message: "Link missing" });

  let linkSegregation = link.split("/");
  const origin = linkSegregation[2];
  const videoid = linkSegregation[linkSegregation.length - 1];

  if (origin != "vimeo.com")
    return res
      .status(400)
      .json({ error: "Bad request", message: "Cannot process this origin" });

  let client = new Vimeo(
    process.env.VIMEO_CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.PERSONAL_ACCESS_TOKEN
  );

  try {
    client.request(
      {
        method: "GET",
        hostname: "api.vimeo.com",
        path: `/videos/${videoid}`,
      },
      async function (error, body, status_code, headers) {
        if (error) {
          return res.status(status_code).json({ err: body, headers: headers });
        }

        let playableLink = "";
        return res.status(200).json({ link: body.player_embed_url });
        for (let i = 0; i < body.files.length; i++) {
          const element = body.files[i];
          if (element.quality == "hls") {
            playableLink = element.link;
            break;
          }
        }

        res.status(200).json({ link: playableLink });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error, message: "Internal server error" });
  }
};

const getytVideoData = async (req, res) => {
  const youtube = google.youtube({
    version: "v3",
    auth: "AIzaSyCOFQnr5gTsCbDfYORyXq7v65wK8l7-kqU", // Replace with your API key
  });

  try {
    const { videoId } = req.params;

    // Make a request to the YouTube API to get video details
    const response = await youtube.videos.list({
      part: "snippet,contentDetails",
      id: videoId,
    });

    // Check if the video is private
    const video = response.data.items[0];
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    const isPrivate = video.status.privacyStatus === "private";

    if (isPrivate) {
      return res
        .status(403)
        .json({ error: "Private video. Authentication required." });
    }

    // Generate a playable URL
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    res.json({ videoUrl });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { getVideoData, getytVideoData };
