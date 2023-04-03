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

// app.get(`/calls/basicData`, (req, res) => {
//     const options = {
//         method: `GET`,
//         url: `https://www.ncei.noaa.gov/cdo-web/api/v2/datasets`,
//         params: {},
//         headers: {
//             'token': process.env.NOAA_KEY
//         }
//     };
//     axios.request(options).then((response) => {
//         res.status(200).json(response.data)
//     }).catch((error) => {
//         console.error(error);
//     })
// });

// app.get(`/calls/allLocations`, (req, res) => {
//     const options = {
//         method: `GET`,
//         url: `https://www.ncei.noaa.gov/cdo-web/api/v2/locations`,
//         params: {},
//         headers: {
//             'token': process.env.NOAA_KEY
//         }
//     };
//     axios.request(options).then((response) => {
//         res.status(200).json(response.data)
//     }).catch((error) => {
//         console.error(error);
//     })
// });

// app.get(`/calls/getLocation`, (req, res) => {
//     const address = `83642`;
//     axios.request({
//         method: `GET`,
//         url: `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.GOOGLE_MAPS_KEY}`,
//         params: {},
//         headers: {
//             'token': process.env.NOAA_KEY
//         }
//     }).then((response) => {
//         res.status(200).json(response.data)
//     }).catch((error) => {
//         console.error(error);
//     });
// });

app.get(`/calls/getPlacePhoto`, (req, res) => {
    const searchParams = new URLSearchParams(req.query);
    const placePhotosURL = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${searchParams.get("width")}&photo_reference=${searchParams.get("photo_reference")}&key=${process.env.GOOGLE_MAPS_KEY}`;
    return res.status(200).json({
        url: placePhotosURL
    });
});

<<<<<<< HEAD
app.get(`/ calls / getPlaceDetails`, (req, res) => {
    const searchParams = new URLSearchParams(req.query);
    const searchURL = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${searchParams.get("locale")}&inputtype=textquery&fields=formatted_address,name,photo,geometry&key=${process.env.GOOGLE_MAPS_KEY}`;

=======
app.get(`/calls/getGridLocation`, (req, res) => {
    const searchParams = new URLSearchParams(req.query);
    const searchURL = `https://api.weather.gov/points/${searchParams.get("lat")},${searchParams.get("lng")}`;
>>>>>>> be0a870 (Initial commit with backend data calls built)
    axios.request({
        method: `GET`,
        url: searchURL
    }).then((response) => {
        res.status(200).json(response.data)
    }).catch((error) => {
        console.error(error);
    });
});

app.get(`/calls/getForecast`, async (req, res) => {
<<<<<<< HEAD

    let newResponseObj = {};
=======
>>>>>>> be0a870 (Initial commit with backend data calls built)
    const searchParams = new URLSearchParams(req.query);

    const placeURL = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${searchParams.get("locale")}&inputtype=textquery&fields=formatted_address,name,photo,geometry&key=${process.env.GOOGLE_MAPS_KEY}`;
    const placeCode = await axios.request({
        method: `GET`,
        url: placeURL,
        params: {},
    }).then((response) => {
        newResponseObj = {
            ...newResponseObj,
            googlePlaceDetails: response.data,
        };
        return response.data;
    }).catch((error) => {
        console.error(error);
    });

    if (placeCode?.candidates?.length === 0 || !placeCode.candidates[0].geometry?.location?.lat) return res.status(400);

    const lat = placeCode.candidates[0].geometry.location.lat;
    const lng = placeCode.candidates[0].geometry.location.lng;
    const pointsSearchURL = `https://api.weather.gov/points/${lat},${lng}`;
    const getWeatherGridPoints = await axios.request({
        method: `GET`,
        url: pointsSearchURL
    }).then((response) => {
        newResponseObj = {
            ...newResponseObj,
            weatherPoints: response.data,
        };
        return response.data;
    }).catch((error) => {
        console.error(error);
    });

    if (!getWeatherGridPoints?.properties?.forecast) return res.status(400);

    await axios.request({
        method: `GET`,
        url: getWeatherGridPoints?.properties?.forecast
    }).then((response) => {
        newResponseObj = {
            ...newResponseObj,
            forecast: response.data,
        };
        res.status(200).json(newResponseObj)
        return response.data;
    }).catch((error) => {
        console.error(error);
    });

});

app.listen(PORT, () => {
    console.log('back end running on port 3001')
});