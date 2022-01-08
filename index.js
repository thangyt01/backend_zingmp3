const express = require('express')
const mongoose = require('mongoose')
var bodyParser = require('body-parser')
require('dotenv').config()
const app = express()
const port = 5000
const authRoute = require('./routes/auth')
const usersRoute = require('./routes/users')
const songsRoute = require('./routes/songs')

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('Connect db successfully!'))
  .catch((e) => console.log(e))
  
app.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type, Accept,Authorization,Origin, token");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Credentials", true);
    next();
});
app.use(express.json())

app.use("/api/auth/", authRoute)
app.use("/api/users/", usersRoute)
app.use("/api/songs/", songsRoute)

app.get("/test", (req, res)=>{
    res.json("test")
})

app.listen(process.env.PORT || 5000, () => {
    console.log(`Example app listening at`)
})