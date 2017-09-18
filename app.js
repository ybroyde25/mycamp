var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    Campground  = require("./models/campground"),
    Comment     = require("./models/comment"),
  //  seedDB      = require("./seeds"),
     User       = require("./models/user"),
     flash      = require("connect-flash"),
     cookieParser = require("cookie-parser"),
   passport     = require("passport"),
 LocalStrategy  = require("passport-local"),
 methodOverride = require("method-override");
// passportLocalMongoose=require("passport-local-mongoose");
require('dotenv').load();
 
 var commentRoutes   = require("./routes/comments"),
     campgroundRoutes= require("./routes/campgrounds"),
     indexRoutes     = require("./routes/index");
//mongoose.connect("mongodb://ybroyde:33rockefeller@ds123752.mlab.com:23752/ybroyde/my_camp_v8");
 var url = process.env.DATABASEURL || mongoose.connect "mongodb://localhost/yelp_camp-v11"
 //mongoose.connect(process.env.DATABASEURL);
 mongoose.Promise = global.Promise;
// mongoose.connect("mongodb://localhost/yelp_camp-v11");
 
app.use(bodyParser.urlencoded({extended: true}));
app.use(flash());
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
//app.use(cookieParser('secret'));
//require moment
app.locals.moment = require('moment');

//seedDB();

app.use(require("express-session")({
    secret: "You're the best in the world",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res, next){
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.use(indexRoutes);
app.use(campgroundRoutes);
app.use(commentRoutes);
    


app.listen(3000/*process.env.PORT,process.env.IP*/, function(){
   console.log("MyCamp Server Has Started..");
});