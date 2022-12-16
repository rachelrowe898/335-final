const http = require("http");
const fetch = require('node-fetch');
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
/* commented out bc we're broke and can't be affording extra calls :') */
//const req = unirest("GET", "https://skyscanner44.p.rapidapi.com/search");

// use info from findFlights to make API call and return response body
// async function oldFetchAPIData(numTickets, origin, destination, departureDate) {
// 	const currency = "USD";
// 	await req.query({
// 		"adults": numTickets,
// 		"origin": origin,
// 		"destination": destination,
// 		"departureDate": departureDate,
// 		"currency": currency
// 	});
// 	req.headers({
// 		"X-RapidAPI-Key": "83d5143addmshf8f6e06a5eebfc0p16813djsnee59aab7da18",
// 		"X-RapidAPI-Host": "skyscanner44.p.rapidapi.com",
// 		"useQueryString": true
// 	});
// 	await req.end(function (res) {
// 		if (res.error) throw new Error(res.error);
// 		return res.body;
// 	});
// }
let currentFlightsList = new Object();
function makeTable(response) {
	bestFlights = response.itineraries.buckets[0].items; // get "best", first bucket
	tableHTML = "<table border='1'>";
	tableHTML += "<tr><th>Select to Bookmark</th><th>Price of Flight</th></tr>";
	let idx = 0;
	bestFlights.forEach(element => {
		// do fields we'll put in mongo, tbd
		let idStr = "box" + idx;
		currentFlightsList[idStr] = {id: element.id, price: element.price.formatted, origin: element.legs[0].origin.id, destination: element.legs[0].destination.id, date: element.legs[0].departure};
		console.log("flight added: " + currentFlightsList[idStr].price);
		tableHTML += "<tr>";
		tableHTML += `<td><input type="checkbox" id="${idStr}" value="${idx}" name="bookmarkedFlights"/></td>`; // could change to be flight1, flight2, etc
		tableHTML += `<td>${element.price.formatted}</td>`;
		tableHTML += "</tr>";
		idx++;
	});
	tableHTML += "</table>";
	console.log(currentFlightsList);
	return tableHTML;

}

function makeBookmarksTable(bookmarkedFlights) {
	tableHTML = "<table border='1'>";
	tableHTML += "<tr><th>Price</th><th>Origin</th><th>Destination</th><th>Date</th></tr>";
	
	console.log("length of bookmarkedFlights:" + bookmarkedFlights.length);
	console.log("bookmarkedFlightsList[0].price: " + currentFlightsList["box1"].price)
	console.log("currentFlightsList: " + currentFlightsList);
	bookmarkedFlights.forEach(idx => {
		let idStr = "box" + idx;
		let flight = currentFlightsList[idStr];
		tableHTML += "<tr>";
		tableHTML += `<td>${flight.price}</td>`;
		tableHTML += `<td>${flight.origin}</td>`;
		tableHTML += `<td>${flight.destination}</td>`;
		tableHTML += `<td>${flight.date}</td>`;
		tableHTML += "</tr>";
	});
	tableHTML += "</table>";
	console.log(tableHTML);
	return tableHTML;

}

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
	const months = {
		January: '01',
		February: '02',
		March: '03',
		April: '04',
		May: '05',
		June: '06',
		July: '07',
		August: '08',
		September: '09',
		October: '10',
		November: '11',
		December: '12',
	}
	let formattedDay = (day.toString().length == 2) ? day : "0" + day.toString();
	let formattedDate = year + "-" + months[month] + "-" + formattedDay;
	console.log(formattedDate);
	const url = `https://skyscanner44.p.rapidapi.com/search?adults=${numTickets}&origin=${origin}&destination=${destination}&departureDate=${formattedDate}&currency=USD`;
	const options = {
		method: 'GET',
		headers: {
		  'X-RapidAPI-Key': '1a749e999emsh3e7cfb511775fcep1d780cjsn7dd345578276',
		  'X-RapidAPI-Host': 'skyscanner44.p.rapidapi.com'
		}
	  };
	  function sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	} // sleep before querying api again
	
	let apiJSON;
	let idGlobal;
	let apiCallCount = 0;
	const maxApiCallCount = 4;
	function getAPIInformation() {
		idGlobal = setInterval(makeAPICall, 5000);
		console.log("idGlobal in getAPIInformation: " + idGlobal);
	}
	function makeAPICall() {
		apiCallCount++;
		fetch(url, options)
		.then(res => res.json())
		.then(json => {console.log("fetch: " + json.context.totalResults); apiJSON = json; console.log("apiJSON1: " + apiJSON);})
		.catch(err => console.error('error:' + err));

		if(apiCallCount > maxApiCallCount || apiJSON !== undefined) {
			if (apiCallCount > maxApiCallCount) {
				clearInterval(idGlobal);
				// error message
				let displayFlightsTable = "<h3 style='color:red'>Sorry, there was an error retrieving your flights. Please try again.</h3>";
				resp.render("displayFlights", {name, email, origin, destination, date, numTickets, displayFlightsTable, currentDate});
			} else if (Number(apiJSON.context.totalResults) >= 5){
				clearInterval(idGlobal);
				let displayFlightsTable = makeTable(apiJSON);
				resp.render("displayFlights", {name, email, origin, destination, date, numTickets, displayFlightsTable, currentDate});
			}
		}
	}
	getAPIInformation();
	// fetch(url, options)
	// 	.then(res => res.json())
	// 	.then(json => console.log("first fetch: " + json.context.totalResults))
	// 	.catch(err => console.error('error:' + err));
	// sleep(5000);
	// fetch(url, options)
	// 	.then(res => res.json())
	// 	.then(json => {console.log("second fetch: " + json.context.totalResults); makeTable(json)})
	// 	.then(displayFlightsTable => resp.render("displayFlights", {name, email, origin, destination, date, numTickets, displayFlightsTable, currentDate}))
	// 	.catch(err => console.error('error:' + err));

	// sleep(5000);
	// fetch(url, options)
	// 	.then(res => res.json())
	// 	.then(json => {console.log("second fetch: " + json.context.totalResults); makeTable(json)})
	// 	.then(displayFlightsTable => resp.render("displayFlights", {name, email, origin, destination, date, numTickets, displayFlightsTable, currentDate}))
	// 	.catch(err => console.error('error:' + err));

	// send info to func that calls API and parses that response to make that flightTable
	//let responseBody = fetchAPIData(numTickets, origin, destination, formattedDate);
	//const responseBody = require(`./sampleResponse.json`);
	//let displayFlightsTable = makeTable(responseBody);
	// store bookmarked flights in MongoDB here
	//resp.render("displayFlights", {name, email, origin, destination, date, numTickets, displayFlightsTable, currentDate});
});

app.post('/displayFlights', (req, resp) => {
	let currentDate = new Date();
	const { bookmarkedFlights } = req.body;
	bookmarkedFlights.forEach(flight => console.log(flight))
	let displayFlightsTable = makeBookmarksTable(bookmarkedFlights);
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
