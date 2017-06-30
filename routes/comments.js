var express = require("express");
var router  = express.Router();
var Campground =require("../models/campground");
var Comment = require("../models/comment");
var middleWare = require("../middleware");

router.get("/campgrounds/:id/comments/new",middleWare.isLoggedIn,function(req,res){
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        }else{
            res.render("comments/new", {campground: campground});
        }
    });
});

router.post("/campgrounds/:id/comments",middleWare.isLoggedIn, function(req, res){
   //lookup campground using ID
   Campground.findById(req.params.id, function(err, campground){
       if(err){
           console.log(err);
           res.redirect("/campgrounds");
       } else {
        Comment.create(req.body.comment, function(err, comment){
           if(err){
            req.flash("error", "Something went wrong");
               console.log(err);
           } else {
               // add id and username
               comment.author.id = req.user._id;
               comment.author.username = req.user.username;
               //save comment
               comment.save();
               campground.comments.push(comment);
               campground.save();
              // console.log(comment);
               req.flash("success", "Successfully added comment");
               res.redirect('/campgrounds/' + campground._id);
           }
        });
       }
   });

});

// COMMENT EDIT ROUTE
router.get("/campgrounds/:id/comments/:comment_id/edit",middleWare.checkCommentOwnership, function(req, res){
   Comment.findById(req.params.comment_id, function(err, foundComment){
      if(err){
          res.redirect("back");
      } else {
        res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
      }
   });
});

// COMMENT UPDATE  middleware.checkCommentOwnership,
router.put("/campgrounds/:id/comments/:comment_id",middleWare.checkCommentOwnership, function(req, res){
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
      if(err){
          res.redirect("back");
      } else {
          res.redirect("/campgrounds/" + req.params.id );
      }
  });
});

// COMMENT DESTROY ROUTE
router.delete("/campgrounds/:id/comments/:comment_id", middleWare.checkCommentOwnership, function(req, res){
    //findByIdAndRemove
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
      if(err){
          res.redirect("back");
      } else {
           req.flash("success", "Comment deleted");
          res.redirect("/campgrounds/" + req.params.id);
      }
    });
});


module.exports = router;