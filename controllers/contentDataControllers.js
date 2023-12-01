const { Vimeo } = require("vimeo");
const dotenv = require("dotenv");

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
    process.env.CLIENT_ID,
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

module.exports = { getVideoData };
