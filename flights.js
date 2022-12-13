const http = require("http");
const unirest = require("unirest");
let path = require("path");
const express = require("express");
const app = express();
const bodyParser = require("body-parser"); /* To handle post parameters */
const fs = require("fs");
const port = process.argv[2];
require("dotenv").config({ path: path.resolve(__dirname, 'credentialsDontPost/.env') })  

const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;

/* Our database and collection */
const databaseAndCollection = {db: process.env.MONGO_DB_NAME, collection: process.env.MONGO_COLLECTION};

const { MongoClient, ServerApiVersion } = require('mongodb');


const uri = `mongodb+srv://${userName}:${password}@cluster0.ytqxemr.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

/* Skyscanner API call to get best flights 
params: int numAdults, String origin, String destination, String departureDate, String currency
note: numAdults allows values 1-8, departureDate in format YYYY-MM-DD
*/
/* commented out bc we're broke and can't be affording extra calls :')
const req = unirest("GET", "https://skyscanner44.p.rapidapi.com/search");

req.query({
	"adults": "1",
	"origin": "MUC",
	"destination": "BER",
	"departureDate": "2022-10-11",
	"currency": "EUR"
});

req.headers({
	"X-RapidAPI-Key": "83d5143addmshf8f6e06a5eebfc0p16813djsnee59aab7da18",
	"X-RapidAPI-Host": "skyscanner44.p.rapidapi.com",
	"useQueryString": true
});

req.end(function (res) {
	if (res.error) throw new Error(res.error);

	console.log(res.body);
});
*/

/* Constructing routes */

// async function main() {
//     const uri = `mongodb+srv://${userName}:${password}@cluster0.ytqxemr.mongodb.net/?retryWrites=true&w=majority`;
//     const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//     try {
//         await client.connect();

//         /* App Part Start */

//         app.use(bodyParser.urlencoded({extended:false}));
//         app.set("views", path.resolve(__dirname, "templates"));
//         app.set("view engine", "ejs");

//         app.listen(port);

//         app.get('/', (req, resp) => {
//             resp.render("index");
//         });
//         app.get('/findFlights', (req, resp) => {
//             resp.render("findFlights");
//         });
//         app.get('/displayFlights', (req, resp) => {
//             resp.render("displayFlights");
//         });
//         app.get('/getBookmarkedFlights', (req, resp) => {
//             resp.render("getBookmarkedFlights");
//         });
//         app.post('/getBookmarkedFlights', (req, resp) => {
//             resp.render()
//         });

//         /* App Part End */
//     } catch (e) {
//         console.error(e);
//     }
// }

/* End constructing routes */

const portNum = process.argv[2];

process.stdin.setEncoding("utf8"); /* encoding */
const intro = "Web server started and running at http://localhost:"+portNum;
const prompt = "Stop to shutdown the server: ";
console.log(intro);
process.stdout.write(prompt);
process.stdin.on('readable', () => {  /* on equivalent to addEventListener */

	let dataInput = process.stdin.read();

	if (dataInput !== null) {
		let command = dataInput.trim();

		if (command === "stop") {
			console.log("Shutting down the server");
            process.exit(0);  /* exiting */
		} else{
            /* After invalid command, we cannot type anything else */
			console.log(`Invalid command: ${command}`);
        }
    }

    process.stdin.resume();
	process.stdout.write(prompt);
});



const publicPath = path.resolve(__dirname, "templates");

/* directory where templates will reside */
app.set("views", path.resolve(__dirname, "templates"));

/* view/templating engine */
app.set("view engine", "ejs");

/* Initializes request.body with post information */ 
app.use(bodyParser.urlencoded({extended:false}));

// console.log("Listening on port: " + portNumber)
/* This endpoint renders the main page of the application and it will display the contents of the index.ejs template file.*/
app.get("/", (request, response) => { 


    /* Generating the HTML */
    response.render("index");

});

app.listen(portNum);
