const express = require("express");

const app = express();

app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("views", "./views");

app.listen(3000, () => {
    console.log('Listening to 3000 port')
});

app.get("/", function(req, res)  {
    res.render("./login");
});


