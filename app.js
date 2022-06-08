if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require("express");
const path = require('path');
const flash = require('connect-flash')
const session = require('express-session');
const mongoose = require('mongoose')
const users = require('./routes/users');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')))
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'))

const dbUrl = process.env.DB_URL
const secret = process.env.SECRET

mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
    console.log("MONGO ATLAS CONNECTION SUCCESSFULLY !!");
}).catch (error => {
    console.log("MONGO CONNECTION ERROR !!")
    console.log(error)
});

app.use(session({
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}))

app.use(flash())
app.use((req,res,next) => {
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

app.use("/",users)


app.listen(process.env.PORT || 3000, () => {
    console.log('Listening to 3000 port')
});




