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

app.get(`/calls/basicData`, (req, res) => {
    const options = {
        method: `GET`,
        url: `https://www.ncei.noaa.gov/cdo-web/api/v2/datasets`,
        params: {},
        headers: {
            'token': process.env.NOAA_KEY
        }
    };
    axios.request(options).then((response) => {
        res.status(200).json(response.data)
    }).catch((error) => {
        console.error(error);
    })
});

app.get(`/calls/allLocations`, (req, res) => {
    const options = {
        method: `GET`,
        url: `https://www.ncei.noaa.gov/cdo-web/api/v2/locations`,
        params: {},
        headers: {
            'token': process.env.NOAA_KEY
        }
    };
    axios.request(options).then((response) => {
        res.status(200).json(response.data)
    }).catch((error) => {
        console.error(error);
    })
});

app.get(`/calls/getLocation`, (req, res) => {
    const address = `83642`;
    axios.request({
        method: `GET`,
        url: `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.GOOGLE_MAPS_KEY}`,
        params: {},
        headers: {
            'token': process.env.NOAA_KEY
        }
    }).then((response) => {
        res.status(200).json(response.data)
    }).catch((error) => {
        console.error(error);
    });
});

app.get(`/calls/getGridLocation`, (req, res) => {
    const searchParams = new URLSearchParams(req.query);
    const searchURL = `https://api.weather.gov/points/${searchParams.get("lat")},${searchParams.get("lng")}`;
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
    const searchParams = new URLSearchParams(req.query);

    const getGeoCode = await axios.request({
        method: `GET`,
        url: `https://maps.googleapis.com/maps/api/geocode/json?address=${searchParams.get("locale")}&key=${process.env.GOOGLE_MAPS_KEY}`,
        params: {},
        headers: {
            'token': process.env.NOAA_KEY
        }
    }).then((response) => {
        return response.data;
    }).catch((error) => {
        console.error(error);
    });

    if (getGeoCode?.results?.length === 0 || !getGeoCode.results[0].geometry?.location?.lat) return res.status(400);

    const lat = getGeoCode.results[0].geometry.location.lat;
    const lng = getGeoCode.results[0].geometry.location.lng;
    const pointsSearchURL = `https://api.weather.gov/points/${lat},${lng}`;
    const getWeatherGridPoints = await axios.request({
        method: `GET`,
        url: pointsSearchURL
    }).then((response) => {
        return response.data;
    }).catch((error) => {
        console.error(error);
    });

    if (!getWeatherGridPoints?.properties?.forecast) return res.status(400);

    await axios.request({
        method: `GET`,
        url: getWeatherGridPoints?.properties?.forecast
    }).then((response) => {
        res.status(200).json(response.data)
        return response.data;
    }).catch((error) => {
        console.error(error);
    });
});

app.listen(PORT, () => {
    console.log('back end running on port 3001')
});