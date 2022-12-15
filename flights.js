const http = require("http");
const unirest = require("unirest");
let path = require("path");
const express = require("express");
const app = express();
const bodyParser = require("body-parser"); /* To handle post parameters */
const fs = require("fs");
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

// use info from findFlights ro make API call and return response body
function fetchAPIData(numTickets, origin, destination, departureDate) {
	const currency = "USD";
	req.query({
		"adults": numTickets,
		"origin": origin,
		"destination": destination,
		"departureDate": departureDate,
		"currency": currency
	});
	req.headers({
		"X-RapidAPI-Key": "83d5143addmshf8f6e06a5eebfc0p16813djsnee59aab7da18",
		"X-RapidAPI-Host": "skyscanner44.p.rapidapi.com",
		"useQueryString": true
	});
	req.end(function (res) {
		if (res.error) throw new Error(res.error);
		return res.body;
	});
}

*/

/* Constructing routes */

// async function main() {
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
//         
//         

//         /* App Part End */
//     } catch (e) {
//         console.error(e);
//     }
// }



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
			console.log(`Invalid command: ${command}`);
        }
    }
    process.stdin.resume();
	process.stdout.write(prompt);
});

/* directory where templates will reside */
app.set("views", path.resolve(__dirname, "templates"));

/* view/templating engine */
app.set("view engine", "ejs");

// location for pictures
app.use(express.static('public'));

/* Initializes request.body with post information */ 
app.use(bodyParser.urlencoded({extended:false}));

/* Constructing routes */
app.get("/", (request, response) => { 
    response.render("index");
});

app.get('/findFlights', (req, resp) => {
    resp.render("findFlights");
});

app.post('/findFlights', (req, resp) => {

    const {name, email, origin, destination, month, day, year, numTickets} = req.body;
	let date = month + " " + day + ", " +year;
	let currentDate = new Date();;

	// send info to func that calls API and parses that response to make that flightTable
	let responseBody = fetchAPIData(numTickets, origin, destination, departureDate);
	let displayFlightsTable = makeTable(responseBody);
	resp.render("displayFlights", {name, email, origin, destination, date, numTickets, currentDate});
});

app.post('/displayFlights', (req, resp) => {
	let currentDate = new Date();
	// pass the bookmarked flights table here!
	resp.render("displayNewBookmarkedFlights.ejs", {currentDate, displayFlightsTable})
})

// app.get('/displayFlights', (req, resp) => {
    
//     resp.render("displayFlights");
// });

app.get('/getBookmarkedFlights', (req, resp) => {
    resp.render("getBookmarkedFlights");
});
app.post('/getBookmarkedFlights', (req, resp) => {
    const {email} = req.body
});

app.post('/yourBookmarkedFlights', (req, resp) => {
    const {email} = req.body
    resp.render("yourBookmarkedFlights");
});

app.listen(portNum);

/* End constructing routes */
