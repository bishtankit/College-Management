const express = require("express");
const bodyParser = require("body-parser");

const https = require("https");
const parseUrl = express.urlencoded({ extended: false });
const parseJson = express.json({ extended: false });
const ejs = require("ejs");
const app = express();


const mongoose = require('mongoose');
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


const port = process.env.PORT || 3000


app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
  secret: "Besto Frienda",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/collegeDB");

const studentSchema = new mongoose.Schema({
  fname: String,
  lname: String,
});

studentSchema.plugin(passportLocalMongoose);

const Student = mongoose.model("Student", studentSchema);

passport.use(Student.createStrategy());

passport.serializeUser(Student.serializeUser());
passport.deserializeUser(Student.deserializeUser());

//GET ROUTES

app.get("/", function(req, res){
  if(req.isAuthenticated()){
    res.render("home.ejs");
  }else{
    res.render("welcome.ejs");
  }
});

app.get("/sign-up", function(req, res){
res.render("sign-up.ejs");
});


app.get("/attendance", function(req, res){
res.render("attendance.ejs");
});

app.get("/faculty", function(req, res){
res.render("faculty.ejs");
});

app.get("/log-out", function(req, res){
  req.logout();
  res.redirect("/");
});




















//POST ROUTES

app.post("/sign-in", function(req, res){

  console.log(req.body.username);
  console.log(req.body.password);

  const user = new Student({
    username: req.body.username,
    password: req.body.password
  });
  req.login(user, function(err){
    if(err){
      console.log(err);
    }else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/");
      });
    }
  })
});



app.post("/sign-up", function(req, res){

  var i;

    Student.register({username: req.body.username}, req.body.password, function(err, user){

    if(err){
      console.log(err);
      res.send("User with the given mobile number is registered with us please login");
    }else{
      passport.authenticate("local")(req, res, function(){
        Student.findById(req.user.id, function(err, found){

        if(err){
          console.log(err);
        }else{
          if(found){
            found.fname = req.body.fname;
            found.lname = req.body.lname;
            found.save(function(){
              res.redirect("/");
            });
          }
        }
      });
      });
    }
    });

});













app.listen(port, function(){
  console.log("server started on port 3000");
});
