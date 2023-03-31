// const http = require('http');
// const fs = require('fs');
// require('dotenv').config();

// http.createServer((req, res) => {
//     res.writeHead(200, { 'Content-Type': 'text/html' });

//     if (req.url === '/') {
//         const readStream = fs.createReadStream(`./index.html`);
//         res.writeHead(200, { 'Content-type': 'text/html' });
//         readStream.pipe(res);
//     }

//     if (req.url === '/styles/index.css') {
//         const readStream = fs.createReadStream(`./styles/index.css`);
//         res.writeHead(200, { 'Content-type': 'text/html' });
//         readStream.pipe(res);
//     }

//     if (req.url === '/js/script.js') {
//         const readStream = fs.createReadStream(`./js/script.js`);
//         res.writeHead(200, { 'Content-type': 'text/html' });
//         readStream.pipe(res);
//     }
// }).listen(3001, (error) => {
//     if (error) {
//         console.log('An error has occured', error);
//     } else {
//         console.log('Server is running on port ' + 3001);
//     }
// });
