const http = require("http");
const fetch = require('node-fetch');
let path = require("path");
const express = require("express");
const app = express();
const bodyParser = require("body-parser"); /* To handle post parameters */
const fs = require("fs");
require("dotenv").config({ path: path.resolve(__dirname, 'credentialsDontPost/.env') })  

let apiJSON;

const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;

/* Our database and collection */
const databaseAndCollection = {db: process.env.MONGO_DB_NAME, collection: process.env.MONGO_COLLECTION};

const { MongoClient, ServerApiVersion } = require('mongodb');
const { response } = require("express");


const uri = `mongodb+srv://${userName}:${password}@cluster0.ytqxemr.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function insertFlight(client, databaseAndCollection, newFlight) {


    const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(newFlight);


}

async function lookupByEmail(client, databaseAndCollection, clientEmail) {
    let filter = {email: clientEmail};
    const result = await client.db(databaseAndCollection.db)
                        .collection(databaseAndCollection.collection)
                        .find(filter);

   if (result) {
       return result;
   } else {
       console.log(`No applicant found with email ${appEmail}`);
   }
}

let currentFlightsList = new Object();
function makeTable(response) {
	tableHTML = "<table border='1'>";
	tableHTML += "<tr><th>Select to Bookmark</th><th>Price of Flight</th><th>Departure Date</th><th>Arrival Date</th></tr>";

	if (response){
		bestFlights = response.itineraries.buckets[0].items; // get "best", first bucket
		
		let idx = 0;
		bestFlights.forEach(element => {
			// do fields we'll put in mongo, tbd
			let idStr = "box" + idx;
			currentFlightsList[idStr] = {id: element.id, price: element.price.formatted, origin: element.legs[0].origin.id, destination: element.legs[0].destination.id, date: element.legs[0].departure};
			tableHTML += "<tr>";
			tableHTML += `<td><input type="checkbox" id="flight${idx}" value="${id}" name="bookmarkedFlights"/></td>`; // could change to be flight1, flight2, etc
			tableHTML += `<td>${element.price.formatted}</td>`;
			tableHTML += `<td>${element.legs[0].departure}</td>`;
			tableHTML += `<td>${element.legs[0].arrival}</td>`;
			tableHTML += "</tr>";
			idx++;
		});
	}
	tableHTML += "</table>";
	return tableHTML;

}

function makeBookmarksTable(bookmarkedFlights) {
	tableHTML = "<table border='1'>";
	tableHTML += "<tr><th>Price</th><th>Origin</th><th>Destination</th><th>Date</th></tr>";

	if(bookmarkedFlights){
		if (len(bookmarkedFlights) == 1) {
			let flight = currentFlightsList["box0"];
			tableHTML += "<tr>";
			tableHTML += `<td>${flight.price}</td>`;
			tableHTML += `<td>${flight.origin}</td>`;
			tableHTML += `<td>${flight.destination}</td>`;
			tableHTML += `<td>${flight.date}</td>`;
			tableHTML += "</tr>";
		} else {
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
		}
	}
	
	tableHTML += "</table>";
	return tableHTML;

}
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

// Skyscanner API call to get best flights 
// params: int numAdults, String origin, String destination, String departureDate, String currency
// note: numAdults allows values 1-8, departureDate in format YYYY-MM-DD
app.post('/displayFlights', (req, resp) => {

    const {name, email, origin, destination, month, day, year, numTickets} = req.body;
	let date = month + " " + day + ", " +year;
	let currentDate = new Date();
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
	
	let idGlobal;
	let apiCallCount = 0;
	const maxApiCallCount = 4;
	function getAPIInformation() {
		idGlobal = setInterval(makeAPICall, 5000);
	}
	function makeAPICall() {
		apiCallCount++;
		fetch(url, options)
		.then(res => res.json())
		.then(json => { apiJSON = json })
		.catch(err => console.error('error:' + err));


		/* COMMENT THIS OUT */
		const fs = require('fs');

		let rawdata = fs.readFileSync('sampleResponse.json');
		apiJSON = JSON.parse(rawdata);


		/* until here */


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

	
	
});


app.post('/displayNewBookmarkedFlights', (req, resp) => {

	const {name, email, origin, destination, month, day, year, numTickets} = req.body;



	let ids = []

	if (req.body.flight0){
		console.log("here");
		console.log(req.body.flight0.value);
	}

	let checked = req.body;

	// console.log(checked);
	
   	// checked.forEach(function (item) {
    //    ids.push(item.id);
   	// });


	let currentDate = new Date();

	let bookTable = makeBookmarksTable(array);

	async function driver(){
        try{
            await client.connect();
	

		
		
			ids.forEach(async (flightID) => {

				let flight = Object.keys(apiJSON.itineraries.buckets.items).find(flight => apiJSON.itineraries.buckets.items.id === flightID);
				await insertFlight(client, databaseAndCollection, flight);
			});


        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
    };

    driver().then((res)=> {


		resp.render("displayNewBookmarkedFlights", bookTable, currentDate);

	});


});





app.get('/getBookmarkedFlights', (req, resp) => {
    resp.render("getBookmarkedFlights");
});


app.post('/yourBookmarkedFlights', (req, resp) => {

    const {email} = req.body

	async function driver(){
        try{
            await client.connect();

            let found = await lookupByEmail(client, databaseAndCollection, email);
            return found;


        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
    };

    driver().then((res)=> {

		let flightsTable = makeBookmarksTable(res);
	

		resp.render("yourBookmarkedFlights", flightsTable);



    });

});

app.get('/flightsRemove', (req, resp) => {

	resp.render("flightsRemove");
});


app.post('/processFlightsRemove', (req, resp) => {


	const {email} = req.body


	async function driver(){

		try {

			await client.connect();

            const result = await client.db(databaseAndCollection.db)
            .collection(databaseAndCollection.collection)
            .deleteMany( { "email" : email } );

            return result.deletedCount;


        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
    };

    driver().then((res) => {
        let variables = {
            numRemoved: res
        };
        response.render("processFlightsRemove", variables);
    });

});



app.listen(portNum);

/* End constructing routes */
