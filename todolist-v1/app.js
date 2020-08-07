// jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname+"/date.js");

const app = express();

const items = [];
const workItems = [];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", function(req, res){

    const day = date.getDate();

    res.render('list', {listTitle: day, newTasks : items});
});

app.get("/work", function(req, res){
    res.render('list', {listTitle:"Work List", newTasks : workItems});
});

app.get("/about", function(req, res) {
    res.render('about')
})

app.post("/", function(req, res){
    let item = req.body.task;
    if(req.body.list == "Work List") {
        
        workItems.push(item);
        res.redirect("/work");
    }else{
    items.push(item);
    res.redirect("/");
    }
});

app.listen(3000, function(req, res){
    console.log("Server started on port 3000");
});
