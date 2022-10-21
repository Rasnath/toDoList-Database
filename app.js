const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js")
const mongoose = require('mongoose');
const _ = require("lodash")

const app = express();
const day = date.getDate()

// Replace user and password.
const userDB = "User"
const passwordDB = "Password"

const uri =
  "mongodb+srv://" + userDB + ":" + passwordDB + "@cluster0.x61lr1o.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(uri, {
  dbName: "toDoListDB"
});

const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name needed"]
  }
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const Item = mongoose.model('Item', itemsSchema);
const List = mongoose.model('List', listSchema);

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"))


app.get("/", function(req, res) {

  Item.find(function(err, itemsDB) {
    if (err) {
      console.log(err);
    } else {
      res.render("list", {
        listTitle: day,
        newListItems: itemsDB
      });
    }
  });
});

app.get('/favicon.ico', (req, res) => {
  return
})

app.get("/:newList", function(req, res) {

  const newListName = _.capitalize(req.params.newList)

console.log(req.params.newList);

  List.findOne({
    name: newListName
  }, function(err, foudList) {
    if (!err) {
      if (!foudList) {
        const list = new List({
          name: newListName,
          newListItems: []
        })
        list.save()
        res.redirect("/" + newListName)
      } else {
        res.render("list", {
          listTitle: newListName,
          newListItems: foudList.items
        });
      }
    }
  })
})

app.post("/", function(req, res) {
  mongoose.connect(uri, {
    dbName: "toDoListDB"
  });

  const itemName = req.body.newItem
  const listName = req.body.list

  const item = new Item({
    name: itemName
  });

  List.findOne({
    name: listName
  }, function(err, foudList) {
    if (!foudList) {
      item.save(function(err) {
        if (!err) {
          res.redirect("/")
        }
      });
    } else {
      foudList.items.push(item)
      foudList.save(function(err) {
        if (!err) {
          res.redirect("/" + listName)
        }
      })
    }
  })
});

app.post("/delete", function(req, res) {
  const item = req.body.itemID
  const listName = req.body.list

  List.findOneAndUpdate({
    name: listName
  }, {
    $pull: {
      items: {
        _id: item
      }
    }
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        Item.deleteOne({
          _id: item
        }, function(err) {
          if (!err) {
            res.redirect("/")
          }
        })
      } else {
        res.redirect("/" + listName)
      }
    }
  })
})

app.listen(3000, function() {
  console.log("Port 3000");
});
