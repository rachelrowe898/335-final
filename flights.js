const http = require("http");
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

/* Constructing routes */

async function main() {
    const uri = `mongodb+srv://${userName}:${password}@cluster0.ytqxemr.mongodb.net/?retryWrites=true&w=majority`;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

    try {
        await client.connect();

        /* App Part Start */

        app.use(bodyParser.urlencoded({extended:false}));
        app.set("views", path.resolve(__dirname, "templates"));
        app.set("view engine", "ejs");

        app.listen(port);

        app.get('/', (req, resp) => {
            resp.render("index");
        });
        app.get('/findFlights', (req, resp) => {
            resp.render("findFlights");
        });
        app.get('/displayFlights', (req, resp) => {
            resp.render("displayFlights");
        });
        app.get('/getBookmarkedFlights', (req, resp) => {
            resp.render("getBookmarkedFlights");
        });
        app.post('/getBookmarkedFlights', (req, resp) => {
            resp.render()
        });

        /* App Part End */
    } catch (e) {
        console.error(e);
    }
}

/* End constructing routes */