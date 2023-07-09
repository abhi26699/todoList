const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');                   // to use database
const _ = require('lodash');
//const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');                  //set ejs to use
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));                  // to use public files

// database part .......
mongoose.connect("mongodb+srv://admin-abhishek:abhishek123@cluster0.ir17ptx.mongodb.net/todolistDB");         // database connection

const ItemSchema = new mongoose.Schema({              // creating schema for todolistDB
  name:String
});

const Item = mongoose.model('Item', ItemSchema);       // creating model using schema, collection should be singular ['Item']

const item1 = new Item({
    name:"Welcome to the todolist application.."
});

const item2 = new Item({
      name:"Click + to add items in the list"
});

const item3 = new Item({
      name:"Click X to delete items from the list"
});

const defaultItem = [item1, item2, item3]

const listSchema = new mongoose.Schema({      // create new schema for custom list
  name:String,
  items: [ItemSchema]
});

const List = mongoose.model("List", listSchema);      // creating model using listSchema

app.get("/",function(req,res) {

  //const day = date.getDate();                  // "date()" - calling the function, "date" - printing the function name

  async function findInDB(){                      // find the records in database
     const Item = mongoose.model('items', ItemSchema);
     const defaultItem = await Item.find({});

     if(Item.length === 0){                 // check if there is any data in databse then insert
       Item.insertMany(defaultItem)
           .then(function(){
           console.log("successfully inserted into database");
         }).catch(function(err){
           console.log(err);
         });
         res.redirect("/");           // return to home page after inserting the  value in database
     }
     else {
       res.render("list", {listTitle:"Today", newListItems:defaultItem});    // listTitle:day
     }
     //console.log(defaultItem);
   }
   findInDB().catch(err => console.log(err));
});


app.post("/",function(req,res) {
   const itemName = req.body.newItem;     // getting the item entered by the user
   const listName = req.body.list;

   const item = new Item({                // creating document with the item given by user
     name:itemName
   });

   if(listName === "Today"){
     item.save();
     res.redirect("/");
   }else{                               // adding records to the custom list by finding them from database
     async function findAll(){
       const List = mongoose.model("List", listSchema);
       const result = await List.findOne({name:listName});
       result.items.push(item);
       result.save();
       res.redirect("/" + listName);
     };

     findAll().catch(err => console.log(err));
   }
});


app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    async function deleteById(){
      const Item = mongoose.model('items', ItemSchema);
      await Item.deleteOne({_id:checkedItemId});
    }
    deleteById().catch(err => console.log(err));
    res.redirect("/");
  }else{
    async function findAndUpdate(){
      await List.findOneAndUpdate({name:listName},{$pull: {items: {_id: checkedItemId}}});
        //if(!error){
          res.redirect("/" + listName);
        //}
    }
    findAndUpdate();
  }
});


// app.get("/:customListName", function (req,res) {
//   const customListName = req.params.customListName;
//   console.log(customListName);
//
//   async function findInDB(){
//     const List = mongoose.model("List", listSchema);
//     const defaultItem = await List.find({name:customListName});
//
//
//     if(defaultItem === customListName){
//       res.render("list", {listTitle:"Today", newListItems:defaultItem});
//     }else{
//       const list = new List({
//         name:customListName,          // taking the name which user entered in the url
//         items: defaultItem            // taking the default list which is used in the home page to store
//       });
//       list.save();
//     }
//   }
//   findInDB().catch(err => console.log(err));
// });


app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  async function findAll(){
    const List = mongoose.model("List", listSchema);
    const result = await List.findOne({name:customListName});

    if(!result){
      // creating new document in database, if it does not exist in database
      const list = new List({
        name:customListName,
        items: defaultItem
      });
      list.save();
      res.redirect("/" + customListName);
    }else{
        res.render("list", {listTitle:result.name, newListItems:result.items});
    }
   }
  findAll().catch(err => console.log(err));
});


app.get("/about",function(req,res) {
  res.render("about");
});


app.listen(process.env.PORT || 3000,function() {          // dynamic port which heroku uses. work on both local and heroku
  console.log("Server is running ....");
})
