const express = require('express');;
let router = express.Router();
const app = express();

router.get("/", function(req, res)  {
    res.render("login");
});
router.get("/register", function(req, res)  {
    res.render("register");
});

module.exports = router;