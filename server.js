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

const noticeSchema = new mongoose.Schema({

mca: String,
mtech: String,
mba: String,
general: String

});

const Notice = mongoose.model("Notice", noticeSchema);


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
  subjects: [String],
  admin: String
});

studentSchema.plugin(passportLocalMongoose);

const Student = mongoose.model("Student", studentSchema);

passport.use(Student.createStrategy());

passport.serializeUser(Student.serializeUser());
passport.deserializeUser(Student.deserializeUser());

var today = new Date();
var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();


//GET ROUTES

app.get("/", function(req, res){
  if(req.isAuthenticated()){
    if(req.user.admin == "true"){

Student.find({}, function(err, found){
  for(var i=0; i<found.length; i++){
    if(found[i].admin == "true"){
      found.splice(i, 1);
    }
  }
    res.render("adminDashboard.ejs",{students: found, success: false});
})

    }else{
      Student.findById(req.user.id, function(err, found){
        res.render("home.ejs",{student: found});
      });
    }
  }else{
    res.render("welcome.ejs");
  }
});



app.get("/sign-up", function(req, res){

  if(req.isAuthenticated()){
    if(req.user.admin == "true"){

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
    if(req.user.admin == "true"){


      Student.find({course: "mtech"}, function(err, found){
        for(var i=0; i<found.length; i++){
          if(found[i].admin == "true"){
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



app.get("/mca", function(req, res){

  if(req.isAuthenticated()){
    if(req.user.admin == "true"){


      Student.find({course: "mca"}, function(err, found){
        for(var i=0; i<found.length; i++){
          if(found[i].admin == "true"){
            found.splice(i, 1);
          }
        }
          res.render("mca.ejs",{students: found, success: false});
      })

    }else{
      res.redirect("/");
    }
  }else{
    res.render("welcome.ejs");
  }
});



app.get("/mba", function(req, res){

  if(req.isAuthenticated()){
    if(req.user.admin == "true"){


      Student.find({course: "mba"}, function(err, found){
        for(var i=0; i<found.length; i++){
          if(found[i].admin == "true"){
            found.splice(i, 1);
          }
        }
          res.render("mba.ejs",{students: found, success: false});
      })

    }else{
      res.redirect("/");
    }
  }else{
    res.render("welcome.ejs");
  }
});














app.get("/attendance", function(req, res){

  if(req.isAuthenticated()){
    if(req.user.admin == "true"){


  res.redirect("/");

    }else{

      Student.findById(req.user.id, function(err, found){
        res.render("attendance.ejs",{student: found});
      })
    }
  }else{
  res.redirect("/");
  }


});

app.get("/faculty", function(req, res){


  if(req.isAuthenticated()){
    if(req.user.admin == "true"){


  res.redirect("/");

    }else{

      Student.findById(req.user.id, function(err, found){
        res.render("faculty.ejs",{student: found});
      })
    }
  }else{
  res.redirect("/");
  }


});

app.get("/log-out", function(req, res){
  req.logout();
  res.redirect("/");
});




app.get("/remove/:id", function(req, res){

  if(req.isAuthenticated()){
    if(req.user.admin == "true"){

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
          if(found[i].admin == "true"){
            found.splice(i, 1);
          }
        }
          res.redirect("/");
      }


    })
  }
});

    }else{
      res.redirect("/");
    }
  }else{
    res.render("welcome.ejs");
  }



});




app.get("/notices", function(req, res){

  if(req.isAuthenticated()){
    if(req.user.admin == "true"){


      Notice.find({}, function(err, found){

    found.forEach(function(notice){

    if( (notice.mca == "" && notice.mtech == "") && notice.mba == "" ){

      Notice.deleteOne({ _id: notice._id }, function (err) {
       if(err){
         console.log("cant delete");
       }else{
         console.log("deleted successfully");
       }
           });

    }

    });


          res.render("notices.ejs", {notices: found});
      })

    }else{
      res.redirect("/");
    }
  }else{
    res.render("welcome.ejs");
  }
});



app.get("/admin-sign-up", function(req,res){
  res.render("admin-sign-up.ejs");
})

app.post("/admin-confirm-signup", function(req,res){
  console.log(req.body.university_password);

if(req.body.university_password == 123){
    res.render("admin-sign-up-confirm");
}else{
  res.send("Wrong password");
}


});

app.post("/new-admin", function(req, res) {
  Student.find({admin: "true"}, function(err, found){
  })

    Student.register({username: req.body.username}, req.body.password, function(err, user){
      if(err){
        console.log(err);
        res.send("User with the given mobile number is registered with us please login");
      }else{
      passport.authenticate("local")(req, res, function(){
             Student.findById(req.user.id, function(err, found){
            found.admin = "true";
            found.save(function(){
              res.redirect("/");
            });
             })
          });

        }
});

})



















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
            found.admin = "false";

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


  if(req.isAuthenticated()){
    if(req.user.admin == "true"){

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
                if(foundStudents[i].admin == "true"){
                  foundStudents.splice(i, 1);
                }
              }
                res.render("adminDashboard.ejs",{students: foundStudents, success: "true"});
            });

        }else{
            res.send("Something went wrong! please try again later");
        }
      });
    }else{
      res.redirect("/");
    }
  }else{
    res.redirect("/");
  }



});


app.post("/notices", function(req, res){


  if(req.isAuthenticated()){

    if(req.user.admin == "true"){

      const notice = new Notice({});

      notice.mca = req.body.mcaNotice;
      notice.mtech = req.body.mtechNotice;
      notice.mba = req.body.mbaNotice;

      notice.save(function(){
        console.log("notice saved successfully");
        res.redirect("/notices");
      });


    }else{
      res.redirect("/");
    }
  }else{
    res.redirect("/")
  }


});


app.post("/remove_notice", function(req, res){
  console.log(req.body);
})


app.post("/get_notices", function(req, res) {

  if(req.isAuthenticated()){


  Notice.find({}, function(err, foundNotices) {
    if(err){
      console.log(err);
    }else{
      if(foundNotices){
        console.log(foundNotices);
        Student.findById(req.user.id, function(err, found){
          res.render("student-notice.ejs",{student: found, notices: foundNotices});
        });
      }
    }
  })

}else{
  res.redirect("/");
}



});









app.listen(port, function(){
  console.log("server started on port 3000");
});
