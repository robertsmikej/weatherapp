//Options for the weather app
const weatherOptions = {
    //Place that will be used on initial load
    defaultLocale: `Boise, ID, USA`,
    photo: {
        desktop: 2200,
        mobile: 800,
    }
};

/**
 * @description - Looks through string for keywords and returns appropriate icon for forecast
 * @param shortForecast - short string
 * @returns {*} icon url in directory to use in forecast
 */
const getCorrectIcon = (shortForecast) => {
    if (!shortForecast) return null;
    const description = shortForecast.toLowerCase();
    if (description.includes("sunny")) return `./../imgs/icons/128/day_clear.png`;
    if (description.includes("cloudy")) return `./../imgs/icons/128/cloudy.png`;
    if (description.includes("thunder")) return `./../imgs/icons/128/thunder.png`;
    if (description.includes("rain")) return `./../imgs/icons/128/rain.png`;
    if (description.includes("snow")) return `./../imgs/icons/128/snow.png`;
    if (description.includes("sleet")) return `./../imgs/icons/128/sleet.png`;
    if (description.includes("wind")) return `./../imgs/icons/128/wind.png`;
    return `./../imgs/icons/128/overcast.png`
};


/**
 * @description - Component for inside cards of forecast - both large card and small cards
 * @param data - Data object for the time period of the forecast
 * @param type - If long exists and equals 'long' then the long forecast will be used instead of short
 * @returns {*} Returns component with template literals
 */
const buildInnerCard = (data, type) => {
    return `
        <div class="wa__card--inner wa__card--conditions">
            <h6>${data.name}</h6>
            <div class="wa__card--row">
                <h4 class="symbol--degree">${data.temperature}</h4>
                <img data-icon src="${getCorrectIcon(data.shortForecast)}" alt="Current Conditions Icon">
            </div>
            <h5>${(type && type === "long") ? data.detailedForecast : data.shortForecast}</h5>
        </div>
    `;
};

/**
 * @description - Parent component for Top Large Card of Forecast
 * @param data - Data object for the time period of the forecast
 * @returns {*} Returns component with template literals
 */
const buildTopCard = (data) => {
    return `
        <div class="wa__card--shadow">
            <div class="wa__card--inner wa__card--conditions">
                ${buildInnerCard(data)}
            </div>
            <div class="wa__card--vertical-line"></div>
            <div class="wa__card--inner wa__card--details">
                <p class="wa__card--details-text">
                    <span>${new Date().toDateString()}</span>
                </p>
                <p class="wa__card--details-text">
                    Wind Speed: <span>${data.windSpeed}</span>
                </p>
                <p class="wa__card--details-text">
                    Wind Direction: <span>${data.windDirection}</span>
                </p>
                <p class="wa__card--details-text">
                    Humidity: <span>${data.relativeHumidity.value}%</span>
                </p>
                <p class="wa__card--details-text">
                    Percipitation: <span>${data.probabilityOfPrecipitation.value}%</span>
                </p>
            </div>
        </div>
    `;
};

/**
 * @description - Slide component for forecast carousel
 * @param data - Data object for the time period of the forecast
 * @returns {*} Returns component with template literals
 */
const buildSlide = (data) => {
    return `
        <li class="glide__slide wa__card">
            <div class="wa__card--shadow">
                ${buildInnerCard(data)}
            </div>
        </li>
    `;
};

/**
 * @description - Calls back end of Node server to make calls needed to populate forecast data
 * @param locale - Where to search for - Text string of place name, zip, etc.
 * @returns {*} Object of data retrieved about place, including photo data and forecast
 */
const getForecastCall = async (locale, widthOfPhotoNeeded) => {
    return await fetch(`http://localhost:3001/calls/getForecast?locale=${locale}&widthOfPhotoNeeded=${widthOfPhotoNeeded}`, {
        method: "GET"
    }).then(response => response.json()).then(data => data).catch((error) => {
        console.error("Error with Forecast Call:", error);
        return error;
    });
};

/**
 * @description - Uses retrieved photo url to change background of photo of place searched for
 * @param photoReference - Reference number from google to search for (place reference they provide)
 */
const getAndSetLocalePhoto = (photoURL) => {
    document.querySelector(".wa__side--wide").style.backgroundImage = `url('${photoURL}')`;
};

/**
 * @description - Sets text on page of where was searched for/is currently being viewed
 * @param locale - Place that was searched for (formatted by Google to be pretty)
 */
const setCurrentLocationBox = (locale) => {
    if (!locale) return null;
    document.querySelector("[data-current-location]").innerHTML = locale;
}

/**
 * @description - Uses data provided to build and replace new large top card for current weather
 * @param forecast - Data object for the time period of the forecast
 */
const setUpTopCard = (forecast) => {
    if (!forecast) return null;
    //Replaces title of section that shows current weather
    const topCardTitle = document.querySelector("[data-current-title]");
    topCardTitle.textContent = forecast.name ? forecast.name : ``;
    //Empties top card so new info can be put in its place
    const topCardContainer = document.querySelector("[data-card-large]");
    topCardContainer.innerHTML = ``;
    //Builds new top card and puts component into appropriate spot
    const topCardBuilt = buildTopCard(forecast);
    topCardContainer.insertAdjacentHTML('beforeend', topCardBuilt);
};

/**
 * @description - Goes through and builds slides and initialized carousel for forecast
 * @param forecast - Data object for the time period of the forecast
 * @returns {*} Mounted Carousel with newest forecast data
 */
const setUpCarousel = (forecast) => {
    if (!forecast) return null;
    const carouselContainer = document.querySelector("[data-carousel-container]");
    carouselContainer.innerHTML = ``;
    forecast.forEach(timePeriod => {
        const newSlide = buildSlide(timePeriod);
        carouselContainer.insertAdjacentHTML('beforeend', newSlide);
    });
    //Shows 2 slides on desktop with a bit of the 3rd peeking out, and goes down to 1 showing on mobile
    new Glide('.glide', {
        perView: 2,
        peek: { before: 0, after: 50 },
        breakpoints: {
            800: {
                perView: 1
            }
        }
    }).mount();
};

/**
 * @description Sets photos, location text on page, and all new forecast data
 * @param forecastData - Data object with all data about the place searched for
 */
const setPageData = (forecastData) => {
    const firstLocaleResult = forecastData?.googlePlaceDetails?.candidates[0];
    if (!firstLocaleResult) return forecastData;
    //If Google Places recognized the place we typed, get photos, set location and set forecast carousel, etc.
    if (forecastData.photoURL?.length > 0) getAndSetLocalePhoto(forecastData.photoURL);
    setCurrentLocationBox(firstLocaleResult.formatted_address ? firstLocaleResult.formatted_address : null);
    if (forecastData?.forecast?.properties?.periods.length > 1) {
        setUpTopCard(forecastData.forecast.properties.periods[0])
        setUpCarousel(forecastData.forecast.properties.periods.slice(1));
    }
};

/**
 * @description - 
 * @param [locale=defaultLocale] - locale defaults to the defaultLocale option
 * @returns {*} Data from all the calls
 */
const getAndSetAllForecastData = async (locale = weatherOptions.defaultLocale) => {
    const widthOfPhotoNeeded = window.innerWidth <= 800 ? weatherOptions.photo.mobile : weatherOptions.photo.desktop;
    return await getForecastCall(locale, widthOfPhotoNeeded);
};

/**
 * @description - If something is in the search bar, searches for that string to find Google data on it
 */
const checkSearchBar = () => {
    const searchBar = document.querySelector("[data-location-input]");
    const searchBarValue = searchBar.value;
    if (!searchBarValue || searchBarValue.length === 0) return null;
    const getForecastData = getAndSetAllForecastData(searchBarValue);
    //Clear search bar on search
    searchBar.value = ``;
    getForecastData.then(forecastData => {
        //When data comes back for new forecast set up everything and change data on page
        setPageData(forecastData);
    })
};

/**
 * @description - Listens for search bar events like submit click and pressing enter
 */
const initSearchBarEvents = () => {
    document.querySelector('[data-location-button]').addEventListener("click", () => {
        checkSearchBar();
    });
    document.querySelector("[data-location-input]").addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            checkSearchBar();
        }
    });
};


/**
 * @description - Initial function run at page load
 */
const initWeather = async () => {
    initSearchBarEvents();
    getAndSetAllForecastData(weatherOptions.defaultLocale).then(data => {
        setPageData(data);
    });
};
document.addEventListener("DOMContentLoaded", initWeather);

//Fallback if there are no search results for location
//Add some generic photos for if there are no photos for search results
//Add loader to show when data is being loaded