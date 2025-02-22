const axios = require("axios");

exports.getCoordinates = async (address) => {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`);
    return response.data.results[0]?.geometry.location;
};
