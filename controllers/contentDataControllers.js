const dotenv = require("dotenv");
const { default: axios } = require("axios");

dotenv.config();

const getPlayableLink = async (req, res) => {
  const { videoId } = req.query;
  if (!videoId)
    return res.status(400).json({
      messsage: "Bad request",
      error: "video id missing",
    });
  else {
    try {
      const response = await axios({
        baseURL: "https://app.tpstreams.com",
        method: "post",
        url: `/api/v1/${process.env.ORG_CODE}/assets/${videoId}/access_tokens/`,
        data: {
          expires_after_first_usage: true,
        },
        headers: {
          Authorization: `Token ${process.env.TP_AUTH_TOKEN}`,
        },
      });
      console.log(response.data);
      let playableLink = response.data.playback_url;
      // for (const element of response.data.results) {
      //   if (element.expires_after_first_usage && element.status == "Active") {
      //     playableLink = element.playback_url;
      //     break;
      //   }
      // }
      res.status(200).json({
        playableLink: playableLink,
        // thumbnail: response.data.video.cover_thumbnail_url,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error });
    }
  }
};

module.exports = {
  getPlayableLink,
};
