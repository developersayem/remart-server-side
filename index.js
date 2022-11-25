const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { query } = require("express");
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');



// MIDDLEWARES
app.use(cors());
app.use(express.json());


// APP HOME
app.get('/', (req, res) => {
    res.send('Hello World!')
})

//MONGO DB API
const uri = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.BD_USER_PASSWORD}@cluster0.4fdxwm9.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//MONGO DB FUNCTION
async function mongoDbRun() {
    try {
        const productCollection = client.db("reMart").collection("products");
        const productCategory = client.db("reMart").collection("productCategory");

        //read all products Categories data
        app.get("/categories", async (req, res) => {
            const query = {};
            const cursor = productCategory.find(query);
            const categories = await cursor.toArray();
            res.send(categories);
        });
        //get product DATA by cetagory id;
        app.get("/category/:id", async (req, res) => {
            const id = req.params.id;
            const query = { category_id: id };
            const cursor = productCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

    } finally { }
} mongoDbRun().catch((err) => console.error(err));



//APP LISTENERS
app.listen(port)