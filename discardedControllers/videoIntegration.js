const { Vimeo } = require("vimeo");
const { google } = require("googleapis");
const pkg = require("ytdl-core");

const { getInfo } = pkg;

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

const get_id_origin = (link) => {
  let videoid = link.split("/");
  let origin = videoid[2];
  videoid = videoid[videoid.length - 1];
  return { videoid, origin };
};

const videoDataApp = async (req, res) => {
  const { onlineLink } = req.query;
  if (!onlineLink)
    return res.status(400).json({
      messsage: "Bad request",
      error: "onlineLink missing",
    });
  else {
    const { videoid, origin } = get_id_origin(onlineLink);
    const qualitiesRes = {};
    try {
      if (origin == "www.youtube.com" || origin == "youtu.be") {
        const ytVideoData = await getInfo(`https://${origin}/${videoid}`);
        let qualityObj = {
          url: "",
          quality_label: "",
          width: 0,
          height: 0,
          fps: 0,
        };
        ytVideoData.player_response.streamingData.formats.forEach((quality) => {
          if (
            quality.mimeType.includes("video/mp4") &&
            quality.width > qualityObj.width
          ) {
            qualityObj = {
              url: quality.url ?? "",
              quality_label: quality.qualityLabel ?? "",
              width: quality.width ?? 0,
              height: quality.height ?? 0,
              fps: quality.fps ?? 0,
            };
            // qualitiesRes[quality.qualityLabel] = qualityObj;
          }
        });
        return res.status(200).json({
          status: 200,
          messgage: "Data fetched successfully",
          data: qualityObj,
        });
      } else if (origin == "vimeo.com") {
        let client = new Vimeo(
          process.env.CLIENT_ID,
          process.env.CLIENT_SECRET,
          process.env.PERSONAL_ACCESS_TOKEN
        );
        client.request(
          {
            method: "GET",
            hostname: "api.vimeo.com",
            path: `/videos/${videoid}`,
          },
          async function (error, body, status_code, headers) {
            if (error) {
              return res.status(status_code).json({
                status: status_code,
                // errorCode: ERROR_CODES.SERVER_ERROR,
              });
            }
            body.files.forEach((quality) => {
              const qualityObj = {
                url: quality.link ?? "",
                quality_label: quality.rendition ?? "",
                width: quality.width ?? 0,
                height: quality.height ?? 0,
                fps: quality.fps ?? 0,
              };
              qualitiesRes[quality.rendition] = qualityObj;
            });
            return res.status(200).json({
              status: 200,
              message: "Data fetched successfully",
              data: Object.values(qualitiesRes),
            });
          }
        );
      } else
        return res.status(200).json({
          status: 200,
          message: "Data fetched successfully",
          data: [
            {
              url: onlineLink,
              quality_label: "",
              width: 0,
              height: 0,
              fps: 0,
            },
          ],
        });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Internal server Error",
        // errorCode: ERROR_CODES.SERVER_ERROR,
      });
    }
  }
};
