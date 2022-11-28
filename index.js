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


/***
         * API Naming Convention 
         * app.get('/booked')
         * app.get('/booked/:id')
         * app.post('/booked')
         * app.patch('/booked/:id')
         * app.delete('/booked/:id')
        */

//MONGO DB API
const uri = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.BD_USER_PASSWORD}@cluster0.4fdxwm9.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//MONGO DB FUNCTION
async function mongoDbRun() {
    try {
        //ALL COLLECTIONS
        const productCollection = client.db("reMart").collection("products");
        const productCategory = client.db("reMart").collection("productCategory");
        const booked = client.db("reMart").collection("booked");
        const usersCollection = client.db("reMart").collection("users");
        //JWT-
        app.post("/jwt", (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ token })
        })
        //VERIFY JWT FUCTION
        function verifyJwt(req, res, next) {

            const authHeader = req.headers.authorization;
            console.log(authHeader)
            if (!authHeader) {
                res.status(401).send({ message: "unauthorized" })
            }
            const token = authHeader;
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
                if (err) {
                    res.status(403).send({ message: "unauthorized" })
                }
                req.decoded = decoded;
                next();
            })
        }

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
        //get product DATA by seller email;
        app.get("/myproducts", async (req, res) => {
            const email = req.query.email;
            const query = { seller_email: email }
            const product = productCollection.find(query);
            const result = await product.toArray();
            res.send(result);
        });
        //get all seller DATA by seller role: seler option;
        app.get("/allseller", async (req, res) => {
            const query = { role: "seller" }
            const product = usersCollection.find(query);
            const result = await product.toArray();
            res.send(result);
        });
        //get all byer DATA by  buyer role: buyer option;
        app.get("/allbuyer", async (req, res) => {
            const query = { role: "buyer" }
            const product = usersCollection.find(query);
            const result = await product.toArray();
            res.send(result);
        });
        //save product booked information
        app.post("/booked", async (req, res) => {
            const data = req.body;
            const reviews = await booked.insertOne(data);
            res.send(reviews);
        });
        //save user information
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })
        //add user product  information
        app.post('/product', async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product);
            res.send(result);
        })
        // delete my product (D)
        app.delete("/myproduct/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.send(result);
        });
        //UPDATE my product status option(U)
        app.put("/myproduct/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const data = req.body;
            const option = { upinsert: true };
            const updatedUser = {
                $set: {
                    status: data.status,
                },
            };
            const result = await productCollection.updateOne(
                filter,
                updatedUser,
                option
            );
            res.send(result);
        });





        //jwt for google sign in method
        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
                return res.send({ token })
            }
            res.status(403).send({ toekn: "" })
        })


    } finally { }
} mongoDbRun().catch((err) => console.error(err));



//APP LISTENERS
app.listen(port)