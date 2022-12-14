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


// JWT VERIFICATION
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization
    // console.log(authHeader)
    if (!authHeader) {
        return res.status(401).send({message: "UnAuthorized Access"})
    }
    const token = authHeader.split(" ")[1]
    // console.log(token)
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            // console.log("This is" ,err)
            return res.status(403).send({message: "Forbidden Access"})
        }
        req.decoded = decoded
        next()
    })

}



async function run() {
    try {
        const categoryCollection = client.db("buysandsells").collection("categoryCollections")
        const productCollection = client.db("buysandsells").collection("productcollections")
        const userCollection = client.db("buysandsells").collection("users")
        const bookingCollection = client.db("buysandsells").collection("bookings")

        const wishListCollection = client.db("buysandsells").collection("wishList")
       
        // Getting Category From Database

        app.get("/categories", async (req, res) => {
            const query = {}
            const result = await categoryCollection.find(query).toArray()
            res.send(result)
        })

        // Getting All Products 
        app.get("/categories/:categoryId", async (req, res) => {
            const categoryId = req.params.categoryId
            console.log("This is", categoryId)
           
            const query = {options: categoryId }
            // console.log("Query" ,query)
            const result = await productCollection.find(query).toArray()
            // console.log(result)
            res.send(result)
        })


        // Getting All The Products From Database

        app.get("/dashboard/addproducts", verifyJWT, async (req, res) => {
            
            const query = { isSeller: true }
            const seller = await userCollection.find(query).toArray()
            if (!seller) {
                return res.status(401).send({message: "UnAuthorized Access"})
            }

            const filter = {}
            const result = await productCollection.find(filter).toArray()
            res.send(result)
        })

        // Posting Product
        app.post("/dashboard/addproducts", verifyJWT, async (req, res) => {

            // const decodedEmail = req.decoded.email
            // console.log(decodedEmail)
            const query = {isSeller : true}
            const seller = await userCollection.find(query).toArray()
            // console.log(seller)
            // console.log("This is decoded" ,decodedEmail)
            // console.log("This is query" ,query)

            if (!seller) {
                return res.status(401).send({message: "UnAuthorized Access"})
            }

            const products = req.body
            // console.log(products)
            const result = await productCollection.insertOne(products)
            res.send(result)
        })
       

        // Getting Seller From Database
        app.get("/seller", async (req, res) => {
            const query = {isSeller : true}
            const result = await userCollection.find(query).toArray()
            res.send(result)
        })

        // Admin List
        app.get("/admin",  async (req, res) => {
            const query = { isAdmin: true }
            const result = await userCollection.find(query).toArray()
            res.send(result)
        })

        // Getting All Users From Database
        app.get("/users", async (req, res) => {
            // const decodedEmail = req.decoded.email
            const email = req.query.email
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

        app.get("/user", async (req, res) => {
            const email = req.query.email
            const query = {email: email}
            const result = await userCollection.findOne(query)
            res.send(result)
        })

        // Getting Booking Products From Database
        app.get("/bookings", verifyJWT, async (req, res) => {
            
            const decodedEmail = req.decoded.email
            // console.log("decodedEmail", decodedEmail)
            const email = req.query.email
            const query = { email: email }
            // console.log("booking Email" ,email)

            if (email !== decodedEmail) {
                return res.status(403).send("Forbidden Access")
            }

            const result = await bookingCollection.find(query).toArray()
            res.send(result)
            
        })

        // Inserting Booking to Database 
        app.post("/bookings", async (req, res) => {
            const bookedPhone = req.body
            const result = await bookingCollection.insertOne(bookedPhone)
            res.send(result)
            })

        // Creating JWT Token

        app.get("/jwt", async (req, res) => {
            const email = req.query.email
            console.log("JWT Email", email)
            const query = { email: email }
            console.log( "This is", query)
            const user = await userCollection.find(query).toArray()
            console.log(user)
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN)
                return res.send({accessToken: token})
            }
            res.status(403).send({message: "Forbidden"})
        })

        // UpDate User
        app.put("/users/:id", async (req, res) => {
            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const options = {upsert: true}
            const updatedDoc = {
                $set: {
                    isVerified: true
                }
            }
            const result = await userCollection.updateOne(filter, updatedDoc, options)
            res.send(result)
        })



        // DeleteUser
        app.delete("/users/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            // console.log(query)
            const result = await userCollection.deleteOne(query)
            res.send(result)
        })

        app.get("/advertiseProduct", async (req, res) => {
            const query = { isAdvertized: true }
            const result = await productCollection.find(query).toArray()
            res.send(result)
        })

        app.get("/wishlist", async (req, res) => {
            
            const email = req.query.email
            console.log("This is", req.query.email)
            const query = { email: email }
            const result = await wishListCollection.find(query).toArray()
            res.send(result)
       })

        // WishList Post Api
        app.post("/wishlist", async (req, res) => {
            const addedProducts = req.body
            const result = await wishListCollection.insertOne(addedProducts)
            res.send(result)
        })

        // Booking Delete Api
        app.delete("/bookings/:id", async (req, res) => {
            const id = req.params.id
            // console.log("This is", id)
            const query = { _id: ObjectId(id) }
            // console.log("This is Quert", query)
            const result = await bookingCollection.deleteOne(query)
            res.send(result)
        })




        
        // WishList Delete Api
        app.delete("/wishlist/:id", async (req, res) => {
            const id = req.params.id
            // console.log("This is", id)
            const query = { _id: ObjectId(id) }
            // console.log("This is Quert", query)
            const result = await wishListCollection.deleteOne(query)
            res.send(result)
        })

        
        
        app.put("/advertised/:id", verifyJWT, async (req, res) => {

            const query = {isSeller : true}
            const seller = await userCollection.find(query).toArray()
            

            if (!seller) {
                return res.status(401).send({message: "UnAuthorized Access"})
            }


            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const options = {upsert: true}
            const updatedDoc = {
                $set: {
                    isAdvertized: true,
                    isBooked: false
                }
            }
            const result = await productCollection.updateOne(filter, updatedDoc, options)
            res.send(result)
        })

        // Delete Functionality
        app.delete("/products/:id", verifyJWT, async (req, res) => {

            const query = {isSeller : true}
            const seller = await userCollection.find(query).toArray()
            

            if (!seller) {
                return res.status(401).send({message: "UnAuthorized Access"})
            }

            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const result = await productCollection.deleteOne(filter)
            res.send(result)
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