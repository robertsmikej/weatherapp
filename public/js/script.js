console.log('Weather App');

const getForecast = async (locale = `83642`) => {
    console.log(locale);
    return await fetch(`http://localhost:3001/calls/getForecast?locale=${locale}`, {
        method: "GET"
    }).then(response => response.json()).then(data => data);
}

const initWeather = async () => {
    const forecastData = await getForecast("83709");
    console.log("forecastData", forecastData);

};

initWeather();