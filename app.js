//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-seerat:test123@cluster0-xuabo.mongodb.net/todolistDB", { useUnifiedTopology: true , useNewUrlParser: true });

const itemsSchema = {
  name : String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
  name : "Cook"
});
const item2 = new Item ({
  name : "Clean"
});
const item3 = new Item ({
  name : "Wash"
});
const defaultItems = [];

const listSchema = {
  name : String,
  items : [itemsSchema]
};
const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  Item.find({},function(err,items){
    if(items.length === 0){
      Item.insertMany(defaultItems , function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Success!");
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: items});
    }
  });
});

app.post("/", function(req, res){

    const item = req.body.newItem;
    const listName =  req.body.list;
  const itemToInsert = new Item ({
    name : item
  });
  if(listName === "Today"){
    itemToInsert.save();
    res.redirect("/");
  }
  else{
    List.findOne({name : listName},function(err,foundList){
      foundList.items.push(itemToInsert);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
});

app.post("/delete", function(req,res){
    const checkedItemId = req.body.deletedItem;
    const listName = req.body.listName;
    if(listName === "Today"){
      Item.findByIdAndRemove(checkedItemId, function(err){
        if(!err){
          console.log("successfully deleted");
        }
      });
      res.redirect("/");
    }
    else{
      List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}},function(err,result){
        if(!err){
          res.redirect("/"+listName);
        }
      })
    }

});

app.get("/:catName", function(req,res){
  const catName = _.capitalize(req.params.catName);
  List.findOne({name : catName}, function(err,foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name: catName,
          items : defaultItems
        });
        list.save();
        res.redirect("/"+catName);
      }
      else{
        res.render("list", {listTitle: foundList.name , newListItems: foundList.items});
      }
    }
  });
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
