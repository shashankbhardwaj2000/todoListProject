const express = require("express");
const bodyParser =require("body-parser");
const app = express();
const mongoose = require("mongoose");
const _=require("lodash")

mongoose.connect("mongodb+srv://admin-shashank:shashank123@cluster0.pcdnrmx.mongodb.net/todolistDB");
const itemsSchema = new  mongoose.Schema({
  name : String
});
const Item = mongoose.model("Item",itemsSchema);
const item1=new Item({
  name : "Eat"
});
const item2=new Item({
  name : "Gym"
});
const item3=new Item({
  name : "Repeat"
});
const defaultItems = [item1,item2,item3];


const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);




day = ""; year="";
app.use(bodyParser.urlencoded({extended:true})); 
app.use(express.static("public"));

app.set('view engine', 'ejs');

app.get("/",function(req,res){
  var date = new Date(); 
  
  year = date.getFullYear();
  options={
    weekday:"long",
    day:"numeric",
    month:"long",
  }
  var currentDay = date.toLocaleDateString("en-US",options);
  
  day = currentDay;
  Item.find(function(err,allItems){
    if(allItems.length==0) {
      Item.insertMany(
        defaultItems,function(err){
          if(err) console.log(err);
          else console.log("Items added successfully");
        }
      );
      res.redirect("/");
    }
    else res.render("lists",{listTitle:day,newEntries:allItems,year:year}); 
  });
 
})

  app.post("/",function(req,res){
     itemName = req.body.newEntry;
     listName = req.body.list;
      const newItem = new Item({
        name : itemName
      });

    if(listName == day){
      newItem.save();
      res.redirect("/");
    }else{
      List.findOne({name:listName},function(err,listFound){
        if(!err){
          if(listFound){
            listFound.items.push(newItem); 
            listFound.save();
            res.redirect("/"+listName);
          }
        }
      });
    }                               
  });

  app.post("/delete",function(req,res){
    const listName = req.body.listName;
    const id = req.body.checkbox;
    if(listName==day){
      Item.deleteOne({_id:id},function(err){
        if(err) console.log(err);
        else console.log("Successfully deleted the checked item");
      });
      res.redirect("/");
    }else{
      List.findOneAndUpdate(
        {name : listName},
        {$pull:{items : {_id:id}}},
        function(err,found){
          if(!err) res.redirect("/"+listName);
        }
      );
    }
  });

  app.get("/:customListName", function(req, res){
    
    const customListName=_.capitalize(req.params.customListName);
    List.findOne({name:customListName},function(err,listFound){
      if(!err){
        if(!listFound){
            const list = new List({
              name: customListName,
              items: []
            });
            list.save();
            console.log("Added  new list ");
            res.redirect("/"+customListName);
        }else{
          res.render("lists", {listTitle: customListName, newEntries: listFound.items});
        }
      }
    });
  });



  app.post("/compose",function(req,res){
    customListName = req.body.newEntry;
    res.redirect("/"+customListName);
    console.log(customListName);
  });

app.listen(process.env.PORT || 3000,function(){
  console.log("server is up running at port 3000");
})
