//jshint esversion:6
// dotenv package for security
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption'); 

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended:true
}));

mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser:true, useUnifiedTopology:true});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// The salt for encryption
// The database will be encrypted, but only the password field will be encrypted. 
userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields:['password']});

const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res){
    res.render('home', {});
});

app.get("/register", function(req, res){
    res.render('register', {});
});

app.get("/login", function(req, res){
    res.render('login',{});
});

// Notice that there is no get functiion for secrete page route. It's only through register or login page.

app.post("/register", function(req, res){
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });

    newUser.save(function(err){
        if(err) {
            console.log(err);
        } else {
            res.render("secrets", {});
        }
    });
});

// Don't worry mongoose-encryption automatically decrypts the fields when read from the database. in our case the password.
app.post("/login", function(req, res){
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email:username}, function(err, foundUser){
        if(err) {
            console.log(err);
        } else {
            if(foundUser) {
                if (foundUser.password === password) {
                    res.render("secrets");
                } else {
                    res.redirect("/login");
                }
            }
        }
    });

});

app.listen(3000, function(){
    console.log("Server started on port 3000!");
});