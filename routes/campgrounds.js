//var express = require("express");
//var router  = express.Router();
//var Campground =require("../models/campground");
//var middleWare = require("../middleware");
//var geocoder = require('geocoder');
//
//// Define escapeRegex function for search feature
//function escapeRegex(text) {
//    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
//};
////INDEX - show all campgrounds
//router.get("/campgrounds", function(req, res){
//    // Get all campgrounds from DB
//    Campground.find({}, function(err, allCampgrounds){
//       if(err){
//           console.log(err);
//       } else {
//          res.render("campgrounds/index",{campgrounds:allCampgrounds});
//       }
//    });
//});
//
////CREATE - add new campground to DB
//router.post("/campgrounds",middleWare.isLoggedIn, function(req, res){
//    // get data from form and add to campgrounds array
//    var name = req.body.name;
//    var image = req.body.image;
//    var desc = req.body.description;
//    var author = {
//        id: req.user._id,
//        username: req.user.username
//    };
//    var newCampground = {name: name, image: image, description: desc, author: author};
//    // Create a new campground and save to DB
//    Campground.create(newCampground, function(err, newlyCreated){
//        if(err){
//            console.log(err);
//        } else {
//            req.flash("success", "Successfully added Campground");
//            //redirect back to campgrounds page
//            res.redirect("/campgrounds");
//        }
//    });
//});
//
////NEW - show form to create new campground
//router.get("/campgrounds/new",middleWare.isLoggedIn, function(req, res){
//   res.render("campgrounds/new"); 
//});
//
//// SHOW - shows more info about one campground
//router.get("/campgrounds/:id", function(req, res){
//    //find the campground with provided ID
//    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
//        if(err){
//            console.log(err);
//        } else {
//            //render show template with that campground
//            res.render("campgrounds/show", {campground: foundCampground});
//        }
//    });
//});
////edit
//router.get("/campgrounds/:id/edit",middleWare.checkCampgroundOwnership, function(req, res){
//  Campground.findById(req.params.id, function(err, foundCampground){
//      res.render("campgrounds/edit", {campground: foundCampground});
//      
// });
//});  
//
//router.put("/campgrounds/:id",middleWare.checkCampgroundOwnership,function(req,res){
// Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
//     if(err){
//         res.redirect("/campgrounds");
//     }else{
//         res.redirect("/campgrounds/" + req.params.id);
//     }
// });  
//});
//
//router.delete("/campgrounds/:id",middleWare.checkCampgroundOwnership, function(req, res){
//    Campground.findByIdAndRemove(req.params.id, function(err){
//        if(err){
//            res.redirect("/campgrounds");
//        } else{
//             req.flash('error', campground.name + ' deleted!');
//            res.redirect("/campgrounds");
//        }
//    });
//});
//
//
//module.exports = router;
var express = require("express");
var router  = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");
var geocoder = require('geocoder');

// Define escapeRegex function for search feature
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

//INDEX - show all campgrounds
router.get("/campgrounds", function(req, res){
  if(req.query.search && req.xhr) {
      const regex = new RegExp(escapeRegex(req.query.search), 'gi');
      // Get all campgrounds from DB
      Campground.find({name: regex}, function(err, allCampgrounds){
         if(err){
            console.log(err);
         } else {
            res.status(200).json(allCampgrounds);
         }
      });
  } else {
      // Get all campgrounds from DB
      Campground.find({}, function(err, allCampgrounds){
         if(err){
             console.log(err);
         } else {
            if(req.xhr) {
              res.json(allCampgrounds);
            } else {
              res.render("campgrounds/index",{campgrounds: allCampgrounds, page: 'campgrounds'});
            }
         }
      });
  }
});

//CREATE - add new campground to DB
router.post("/campgrounds", middleware.isLoggedIn, function(req, res){
  // get data from form and add to campgrounds array
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var author = {
      id: req.user._id,
      username: req.user.username
  }
  var cost = req.body.cost;
  geocoder.geocode(req.body.location, function (err, data) {
    var lat = data.results[0].geometry.location.lat;
    var lng = data.results[0].geometry.location.lng;
    var location = data.results[0].formatted_address;
    var newCampground = {name: name, image: image, description: desc, cost: cost, author:author, location: location, lat: lat, lng: lng};
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            console.log(newlyCreated);
            res.redirect("/campgrounds");
        }
    });
  });
});

//NEW - show form to create new campground
router.get("/campgrounds/new", middleware.isLoggedIn, function(req, res){
   res.render("campgrounds/new"); 
});

// SHOW - shows more info about one campground
router.get("/campgrounds/:id", function(req, res){
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
          console.log(err);
        } else {
          //console.log(foundCampground);
          //render show template with that campground
          res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

router.get("/campgrounds/:id/edit", middleware.checkCampgroundOwnership , function(req, res){
    //find the campground with provided ID
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err){
            console.log(err);
        } else {
            //render show template with that campground
            res.render("campgrounds/edit", {campground: foundCampground});
        }
    });
});

router.put("/campgrounds/:id", middleware.checkCampgroundOwnership ,function(req, res){
  geocoder.geocode(req.body.location, function (err, data) {
    var lat = data.results[0].geometry.location.lat;
    var lng = data.results[0].geometry.location.lng;
    var location = data.results[0].formatted_address;
    var newData = {name: req.body.name, image: req.body.image, description: req.body.description, cost: req.body.cost, location: location, lat: lat, lng: lng};
    Campground.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
  });
});

router.delete("/campgrounds/:id", middleware.checkCampgroundOwnership , function(req, res) {
  Campground.findByIdAndRemove(req.params.id, function(err, campground) {
    Comment.remove({
      _id: {
        $in: campground.comments
      }
    }, function(err, comments) {
      req.flash('error', campground.name + ' deleted!');
      res.redirect('/campgrounds');
    })
  });
});

module.exports = router;
