# weatherapp

## Installing App on your machine

I'm going to assume a basic knowledge of git, terminal, and node here.

-   Ensure you have npm, node, etc. installed (can always explain this if needed).
<!-- -->
-   First, ensure you're in the directory you want to install the app in.
-   Clone the git repo to your directory: `git clone https://github.com/robertsmikej/weatherapp`
-   In the terminal run `npm install` in directory
<!-- -->
-   You'll need to create .env file at the root of the directory for adding a Google Maps Key for Google Places, this can be obtained with your google account here: https://console.cloud.google.com/project/_/google/maps-apis/credentials
-   Add this to the .env file: GOOGLE_MAPS_KEY="YOUR_KEY_HERE"
<!-- -->
-   To start app type in terminal: `npm run start`
-   This will start the server and allow you to go to `http://localhost:3001/` and see the app
