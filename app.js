const express = require("express");
const users = require('./routes/users');

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use("/",users)
app.use("/register",users)


app.listen(3000, () => {
    console.log('Listening to 3000 port')
});




