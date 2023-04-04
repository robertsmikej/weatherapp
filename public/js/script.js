const defaultLocale = `Boise, ID, USA`;

const getCorrectIcon = (data) => {
    const description = data.shortForecast.toLowerCase();
    if (description.includes("sunny")) return `./../imgs/icons/128/day_clear.png`;
    if (description.includes("cloudy")) return `./../imgs/icons/128/cloudy.png`;
    if (description.includes("thunder")) return `./../imgs/icons/128/thunder.png`;
    if (description.includes("rain")) return `./../imgs/icons/128/rain.png`;
    if (description.includes("snow")) return `./../imgs/icons/128/snow.png`;
    if (description.includes("sleet")) return `./../imgs/icons/128/sleet.png`;
    if (description.includes("wind")) return `./../imgs/icons/128/wind.png`;
    return `./../imgs/icons/128/overcast.png`
};

const buildInnerCard = (data, type) => {
    return `
        <div class="wa__card--inner wa__card--conditions">
            <h6>${data.name}</h6>
            <div class="wa__card--row">
                <h4 class="symbol--degree">${data.temperature}</h4>
                <img data-icon src="${getCorrectIcon(data)}" alt="Current Conditions Icon">
            </div>
            <h5>${(type && type === "long") ? data.detailedForecast : data.shortForecast}</h5>
        </div>
    `;
};

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
                    Chance of Percipitation: <span>${data.probabilityOfPrecipitation.value}%</span>
                </p>
            </div>
        </div>
    `;
};

const buildSlide = (data) => {
    return `
        <li class="glide__slide wa__card">
            <div class="wa__card--shadow">
                ${buildInnerCard(data)}
            </div>
        </li>
    `;
};

const getForecastCall = async (locale) => {
    return await fetch(`http://localhost:3001/calls/getForecast?locale=${locale}`, {
        method: "GET"
    }).then(response => response.json()).then(data => data).catch((error) => {
        console.error(error);
    });
};

const getPlacePhotoData = async (photoReference) => {
    console.log(`photoReference`, photoReference);
    const desktopWidth = 2200;
    const mobileWidth = 800;
    const widthToSend = desktopWidth;
    return await fetch(`http://localhost:3001/calls/getPlacePhoto?photo_reference=${photoReference}&width=${widthToSend}`, {
        method: "GET"
    }).then(response => response.json()).then(data => data);
};

const getAndSetLocalePhoto = (photoReference) => {
    const placePhotoData = getPlacePhotoData(photoReference);
    placePhotoData.then(data => {
        document.querySelector(".wa__side--wide").style.backgroundImage = `url('${data.url}')`;
    });
};

const setCurrentLocationBox = (locale) => {
    if (!locale) return null;
    document.querySelector("[data-current-location]").innerHTML = locale;
}



const setUpTopCard = (forecast) => {
    if (!forecast) return null;
    const topCardTitle = document.querySelector("[data-current-title]");
    topCardTitle.textContent = forecast.name ? forecast.name : ``;
    const topCardContainer = document.querySelector("[data-card-large]");
    const topCardBuilt = buildTopCard(forecast);
    topCardContainer.insertAdjacentHTML('beforeend', topCardBuilt);
};

const setUpCarousel = (forecast) => {
    if (!forecast) return null;

    const carouselContainer = document.querySelector("[data-carousel-container]");
    forecast.forEach(period => {
        const slide = buildSlide(period);
        carouselContainer.insertAdjacentHTML('beforeend', slide);
    });
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

const setPageData = (forecastData) => {
    const firstLocaleResult = forecastData?.googlePlaceDetails?.candidates[0];
    if (!firstLocaleResult) return forecastData;
    if (firstLocaleResult.photos?.length > 0) {
        const photoReference = forecastData.googlePlaceDetails.candidates[0].photos[0].photo_reference;
        getAndSetLocalePhoto(photoReference);
    }

    setCurrentLocationBox(firstLocaleResult.formatted_address ? firstLocaleResult.formatted_address : null);

    if (forecastData?.forecast?.properties?.periods.length > 1) {
        setUpTopCard(forecastData.forecast.properties.periods[0])
        setUpCarousel(forecastData.forecast.properties.periods.slice(1));
    }

};

const getAndSetAllForecastData = async (locale = defaultLocale) => {
    return await getForecastCall(locale);
};

const checkSearchBar = () => {
    const searchBar = document.querySelector("[data-location-input]");
    const searchBarValue = searchBar.value;
    if (!searchBarValue || searchBarValue.length === 0) return null;
    const getForecastData = getAndSetAllForecastData(searchBarValue);
    searchBar.value = ``;
    // getForecastData.then(forecastData => {
    //     console.log(3, forecastData);
    // })
};

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

const initWeather = async () => {
    initSearchBarEvents();
    getAndSetAllForecastData(defaultLocale).then(data => {
        setPageData(data);
    });
};

initWeather();

//Write guard clauses everywhere
//Clean up if statements
//Fallback if there are no search results for location
//Add some generic photos for if there are no photos for search results