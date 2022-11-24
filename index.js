const express = require("express")
const app = express()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const jwt = require('jsonwebtoken')
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

        // Getting Products All Products
        // app.get("/categories/:categoryId", async (req, res) => {
        //     const categoryId = req.params.categoryId
        //     console.log("This is", categoryId)
           
        //    const query = {categoryId : categoryId}
        //     const result = await productCollection.find(query).toArray()
        //     res.send(result)
        // })


        // Posting Product
        app.post("/dashboard/addproducts", async (req, res) => {
            const products = req.body
            console.log(products)
            const result = await productCollection.insertOne(products)
            res.send(result)
        })
       

        // Getting Seller From Database
        app.get("/seller", async (req, res) => {
            const query = {isSeller : true}
            const result = await userCollection.find(query).toArray()
            res.send(result)
        })

        // Getting All Users From Database
        app.get("/users", async (req, res) => {
            const query = {}
            const result = await userCollection.find(query).toArray()
            res.send(result)
        })

        // Store Users in Database
        app.post("/users", async (req, res) => {
            const user = req.body
            const result = await userCollection.insertOne(user)
            res.send(result)
        })


        // Creating JWT Token

        app.get("/jwt", async (req, res) => {
            const email = req.query.email
            const query = {email : email}
            const user = await userCollection.findOne(query)
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN)
                return res.send({accessToken: token})
            }
            res.status(403).send({message: "Forbidden"})
        })
    }
    finally {
        
    }
}
run().catch(err=> console.log(err))



app.get("/", (req, res) => {
    res.send("Server Is Running")
})

app.listen(port, () => {
    console.log("Port is Running At", port)
})