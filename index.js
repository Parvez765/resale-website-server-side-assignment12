const expres = require("express")
const app = expres()
const port = process.env.PORT || 5000


app.get("/", (req, res) => {
    res.send("Server Is Running")
})

app.listen(port, () => {
    console.log("Port is Running At", port)
})