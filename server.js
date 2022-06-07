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
  attendance: {
    subject1: Number,
    subject2: Number,
    subject3: Number,
    subject4: Number
  },
  course: String,
  subjects: [String]
});

studentSchema.plugin(passportLocalMongoose);

const Student = mongoose.model("Student", studentSchema);

passport.use(Student.createStrategy());

passport.serializeUser(Student.serializeUser());
passport.deserializeUser(Student.deserializeUser());

//GET ROUTES

app.get("/", function(req, res){
  if(req.isAuthenticated()){
    if(req.user.fname == "Admin"){

Student.find({}, function(err, found){
  for(var i=0; i<found.length; i++){
    if(found[i].fname == "Admin"){
      found.splice(i, 1);
    }
  }
    res.render("adminDashboard.ejs",{students: found, success: false});
})

    }else{
      res.render("home.ejs");
    }
  }else{
    res.render("welcome.ejs");
  }
});



app.get("/sign-up", function(req, res){

  if(req.isAuthenticated()){
    if(req.user.fname == "Admin"){

    res.render("sign-up.ejs");

    }else{
      res.redirect("/");
    }
  }else{
    res.render("welcome.ejs");
  }
});


app.get("/mtech", function(req, res){

  if(req.isAuthenticated()){
    if(req.user.fname == "Admin"){


      Student.find({course: "mtech"}, function(err, found){
        for(var i=0; i<found.length; i++){
          if(found[i].fname == "Admin"){
            found.splice(i, 1);
          }
        }
          res.render("mtech.ejs",{students: found, success: false});
      })

    }else{
      res.redirect("/");
    }
  }else{
    res.render("welcome.ejs");
  }
});














app.get("/attendance", function(req, res){

Student.findById(req.user.id, function(err, found){
  res.render("attendance.ejs",{student: found});
})

});

app.get("/faculty", function(req, res){
res.render("faculty.ejs");
});

app.get("/log-out", function(req, res){
  req.logout();
  res.redirect("/");
});




app.get("/remove/:id", function(req, res){

  if(req.isAuthenticated()){
    if(req.user.fname == "Admin"){

Student.deleteOne({ _id: req.params.id }, function(err){
  if(err){
    console.log(err);
  }else{
    console.log("successfully deleted the student");
    Student.find({}, function(err, found){
      if(err){
        console.log(err);
      }else{
        for(var i=0; i<found.length; i++){
          if(found[i].fname == "Admin"){
            found.splice(i, 1);
          }
        }
          res.redirect("/");
      }


    })
  }
});

    }else{
      res.render("home.ejs");
    }
  }else{
    res.render("welcome.ejs");
  }



});















//POST ROUTES

app.post("/sign-in", function(req, res){

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
            found.course = req.body.course;

            switch (req.body.course) {
              case "mca":
                found.subjects.push("english");
                found.subjects.push("math");
                found.subjects.push("java");
                found.subjects.push("web");
                break;
              case "mba":
              found.subjects.push("english");
              found.subjects.push("management");
              found.subjects.push("economics");
              found.subjects.push("accounting");
                break;
              case "mtech":
                found.subjects.push("english");
                found.subjects.push("engineering");
                found.subjects.push("math");
                found.subjects.push("database");

            }


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




app.post("/set-attendance", function(req, res){



Student.findById(req.body.id, function(err, found){
  if(found){


     if(req.body.subject1 != ""){
       found.attendance.subject1 = req.body.subject1;
     }

      if(req.body.subject2 != ""){
        found.attendance.subject2 = req.body.subject2;
      }

      if(req.body.subject3 != ""){
        found.attendance.subject3 = req.body.subject3;
      }

      if(req.body.subject4 != ""){
        found.attendance.subject4 = req.body.subject4;
      }


      found.save();

      Student.find({}, function(err, foundStudents){
        for(var i=0; i<foundStudents.length; i++){
          if(foundStudents[i].fname == "Admin"){
            foundStudents.splice(i, 1);
          }
        }
          res.render("adminDashboard.ejs",{students: foundStudents, success: true});
      });

  }else{
      res.send("Something went wrong! please try again later");
  }
});

});









app.listen(port, function(){
  console.log("server started on port 3000");
});
