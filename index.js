const express = require("express")
const app = express()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion } = require('mongodb');


// Middle Ware Setup
const cors = require("cors")

app.use(cors())
app.use(express.json())
require("dotenv").config()


// Database Setup 


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xu0oole.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        const categoryCollection = client.db("buysandsells").collection("categoryCollections")
        const productCollection = client.db("buysandsells").collection("productcollections")
        const userCollection = client.db("buysandsells").collection("users")

        // Getting Category From Database

        app.get("/categories", async (req, res) => {
            const query = {}
            const result = await categoryCollection.find(query).toArray()
            res.send(result)
        })


        // Store Users in Database
        app.post("/users", async (req, res) => {
            const user = req.body
            const result = await userCollection.insertOne(user)
            res.send(result)
        })
    }
    finally {
        
    }
}
run().catch(err=> console.log(error))



app.get("/", (req, res) => {
    res.send("Server Is Running")
})

app.listen(port, () => {
    console.log("Port is Running At", port)
})