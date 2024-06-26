const express = require('express')
const flash = require('connect-flash');
const app = express()
const userRoute = require('./routes/userRoute')
const adminRoute = require('./routes/adminRoute')
const session = require("express-session")
const nocache = require('nocache');
const dotenv = require('dotenv').config()
const {PORT} = process.env

const path = require('path')
app.use(express.static(path.join(__dirname,'../public/user')))
app.set("view engine",'ejs');
app.set('views','./views/users');

app.use(nocache())
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}))

const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://muhammedshabeeb330:d0F3HaDyPmt54EoL@scouser.icgssjw.mongodb.net/turf')
.then(()=>console.log('MongoDB success'))
.catch(()=>console.Console.log('MongoDB cracked'))


app.use(flash());

app.use('/',adminRoute)
app.use('/',userRoute)

app.get('*', (req, res) => {
    res.render('404')
});

app.listen(PORT, () => console.log('http://localhost:8000/'))