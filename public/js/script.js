
const defaultLocale = `Boise, ID, USA`;

const getForecastCall = async (locale) => {
    return await fetch(`http://localhost:3001/calls/getForecast?locale=${locale}`, {
        method: "GET"
    }).then(response => response.json()).then(data => data);
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

const getAndSetAllForecastData = async (locale = defaultLocale) => {
    const forecastData = await getForecastCall(locale);
    const firstLocaleResult = forecastData?.googlePlaceDetails?.candidates[0];
    if (!firstLocaleResult) return null;
    if (firstLocaleResult.photos?.length > 0) {
        const photoReference = forecastData.googlePlaceDetails.candidates[0].photos[0].photo_reference;
        getAndSetLocalePhoto(photoReference);
    }
    setCurrentLocationBox(firstLocaleResult.formatted_address ? firstLocaleResult.formatted_address : null);
    return forecastData;
}

const checkSearchBar = () => {
    const searchBar = document.querySelector("[data-location-input]");
    const searchBarValue = searchBar.value;
    if (!searchBarValue || searchBarValue.length === 0) return null;
    console.log(searchBarValue);
    const getForecastData = getAndSetAllForecastData(searchBarValue);
    searchBar.value = ``;
    getForecastData.then(forecastData => {
        console.log("forecastData", forecastData);
    })
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
    getAndSetAllForecastData(defaultLocale);
    initSearchBarEvents();
};

initWeather();

//Write guard clauses everywhere
//Clean up if statements
//Fallback if there are no search results for location
//Add some generic photos for if there are no photos for search results