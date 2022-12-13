const http = require("http");
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

/* Initializes request.body with post information */ 
app.use(bodyParser.urlencoded({extended:false}));

/* Constructing routes */

app.get("/", (request, response) => { 
    /* Generating the HTML */
    response.render("index");
});
app.get('/findFlights', (req, resp) => {
    const {formAction} = "<form action=\"/findFlights\" method=\"POST\">";
    resp.render("findFlights", {formAction});
});
app.post('/findFlights', (req, resp) => {
    const {name, email, date, destination, price} = req.body;
    resp.render("findFlights", { name, email, date, destination, price});
});
app.get('/displayFlights', (req, resp) => {
    
    resp.render("displayFlights");
});
app.get('/getBookmarkedFlights', (req, resp) => {
    const {formAction} = "<form action=\"getBookmarkedFlights\" method=\"POST\">";
    resp.render("getBookmarkedFlights", {formAction});
});
app.post('/getBookmarkedFlights', (req, resp) => {
    const {email} = req.body
    resp.render("yourBookmarkedFlights", {email});
});
app.listen(portNum);

/* End constructing routes */
