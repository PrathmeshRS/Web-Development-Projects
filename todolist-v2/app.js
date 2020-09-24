// jshint esversion:6
// jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://prathmesh:Sadguru789@cluster0.fqplu.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemsSchema);

const Item1 = new Item({
    name: "Welcome to your to-do list."
});

const Item2 = new Item({
    name: "Hit the + button to add new task."
});

const Item3 = new Item({
    name: "<-- Hit this to delete an item"
});

const defaultItems = [Item1, Item2, Item3];

const listSchema = mongoose.Schema({
    name: String,
    items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res){
    
    Item.find({}, (err,items)=>{
        if(items.length === 0){
            Item.insertMany(defaultItems, err => {
                if(err){
                    console.log(err);
                }else{
                    console.log("Sucessfully inseter items in to-do list");
                }
            });
            res.redirect("/");            
        }else{
        res.render('list', {listTitle: "Today", newTasks : items});
        }
    });
});

app.get("/:customListName", (req, res) => {
    customListName = _.capitalize(req.params.customListName);
    List.findOne({name: customListName}, (err,foundList) => {   
        if(!err){
            if(!foundList){
                // Create a new list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customListName);
            }else {
            // Show an existing list
            res.render('list', {listTitle: foundList.name, newTasks:foundList.items}); 
            }
        }
    });
    
});

app.get("/about", (req, res) => res.render('about'));

app.post("/delete", (req, res) => {
    const listName = req.body.listName;
    checkedItemId = req.body.checkbox;

    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId, err => {
            if(err) {
                console.log(err);
            }else {
                console.log("Item deleted Sucessfully");
            }
            res.redirect("/");
        });
    } else {
        List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}}, (err, foundList) => {
            if(!err){
                res.redirect("/"+listName);
            }
        });
    }
});

app.post("/", (req, res) => {

    const listName = req.body.list;
    let itemName = req.body.task;
    const newItem = new Item({
        name: itemName
    });

    if(listName === 'Today'){
        newItem.save();
        res.redirect("/");
    }else {
        List.findOne({name: listName}, (err, foundList) => {
            foundList.items.push(newItem);
            foundList.save();
            res.redirect("/"+ listName);
        });
    }

    
});

app.listen(process.env.PORT || 3000, function(){ console.log("Server started sucessfully!")});
