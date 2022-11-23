const express = require("express")
const app = express()
const port = process.env.PORT || 5000

// Middle Ware Setup
const cors = require("cors")

app.use(cors())
app.use(express.json())
require("dotenv").config()




app.get("/", (req, res) => {
    res.send("Server Is Running")
})

app.listen(port, () => {
    console.log("Port is Running At", port)
})