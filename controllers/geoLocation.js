const IPGeolocationAPI = require('ip-geolocation-api-javascript-sdk');
const ipgeolocationApi = new IPGeolocationAPI("01644ad17ef4488ba27f5d66f17cf6d8", false);

const getClientGeolocation = async (req, res) => {
  const getGeolocationAsync = () => {
    return new Promise((resolve, reject) => {
      ipgeolocationApi.getGeolocation((json) => {
        if (json) {
          console.log("Please get Logged");
          console.log(json);
          resolve(json);
        } else {
          reject('Error fetching geolocation data');
        }
      });
    });
  };

  try {
    const data = await getGeolocationAsync();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch geolocation data' });
  }
};

module.exports = { getClientGeolocation };
