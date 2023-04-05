const PORT = 3001;
const express = require(`express`);
const axios = require(`axios`);
const cors = require(`cors`);

require('dotenv').config();

const app = express();

app.use(cors());

app.use(express.static('public'))

app.get(`/`, (req, res) => {
    res.sendFile(`/public/index.html`, { root: '.' });
});

//Calls google places to get a photo of the place requested, return object with url to use in img element
app.get(`/calls/getPlacePhoto`, (req, res) => {
    const searchParams = new URLSearchParams(req.query);
    const placePhotosURL = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${searchParams.get("width")}&photo_reference=${searchParams.get("photo_reference")}&key=${process.env.GOOGLE_MAPS_KEY}`;
    return res.status(200).json({
        url: placePhotosURL
    });
});

//Makes 3 calls to get all data needed to display correctly
//Obviously that's not ideal, but many of the apis don't provide everything needed
app.get(`/calls/getForecast`, async (req, res) => {
    let newResponseObj = {};
    const searchParams = new URLSearchParams(req.query);

    //Uses text entered into search box to search for place, returns details of the place like latitude/longitude and if there's a photo that can be downloaded
    const placeURL = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${searchParams.get("locale")}&inputtype=textquery&fields=formatted_address,name,photo,geometry&key=${process.env.GOOGLE_MAPS_KEY}`;
    const placeCode = await axios.request({
        method: `GET`,
        url: placeURL,
        params: {},
    }).then((response) => {
        //Adds the response data into object that will eventually be returned
        newResponseObj = {
            ...newResponseObj,
            googlePlaceDetails: response.data,
        };
        return response.data;
    }).catch((error) => {
        console.error("Google Places API Error:", error);
    });

    if (placeCode?.candidates?.length === 0 || !placeCode.candidates[0].geometry?.location?.lat) return res.status(400);

    //Builds URL for a photo from Google Places for the place being searched for
    const placePhotosURL = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${searchParams.get("widthOfPhotoNeeded")}&photo_reference=${newResponseObj.googlePlaceDetails.candidates[0].photos[0].photo_reference}&key=${process.env.GOOGLE_MAPS_KEY}`;
    newResponseObj.photoURL = placePhotosURL;

    //Uses latitude and longitude to find weather stations near a place
    const lat = placeCode.candidates[0].geometry.location.lat;
    const lng = placeCode.candidates[0].geometry.location.lng;
    const pointsSearchURL = `https://api.weather.gov/points/${lat},${lng}`;
    const getWeatherGridPoints = await axios.request({
        method: `GET`,
        url: pointsSearchURL
    }).then((response) => {
        //Adds the response data into object that will eventually be returned
        newResponseObj = {
            ...newResponseObj,
            weatherPoints: response.data,
        };
        return response.data;
    }).catch((error) => {
        console.error("Lat/Lng API Error:", error);
    });

    if (!getWeatherGridPoints?.properties?.forecast) return res.status(400);

    //Uses nearest weather station to inputed place to get forecast of weather
    await axios.request({
        method: `GET`,
        url: getWeatherGridPoints?.properties?.forecast
    }).then((response) => {
        //Adds the response data into object that will eventually be returned
        newResponseObj = {
            ...newResponseObj,
            forecast: response.data,
        };
        res.status(200).json(newResponseObj)
        return response.data;
    }).catch((error) => {
        console.error("Grid points API Error:", error);
    });

});

app.listen(PORT, () => {
    console.log('back end running on port 3001')
});