const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose')
const _ = require('lodash')

const app = express();
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static('public'))

mongoose.connect('mongodb+srv://jdawan:4kHgDcFl8gpYv2Vt@cluster0.hz6kd.mongodb.net/To-Do-List?retryWrites=true&w=majority')

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required:true
}});

const Item = mongoose.model('Item', itemSchema);

const item1 = new Item({
  name: 'Welcome to your to do list'
});


const item2 = new Item({
  name: 'Lets get started'
});


const item3 = new Item({
  name: 'Hello'
});

const DEFAULT_ITEMS = [item1,item2,item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
})

const List = mongoose.model('List',listSchema);



app.get("/", (req, res) => {
 
Item.find({},(err,foundItems)=>{
  if (foundItems.length === 0) {
    Item.insertMany(DEFAULT_ITEMS);
    res.redirect('/');
  }
  else{
  res.render("list", {Title:'Today', newListItems:foundItems, text:"New Item"});
}})
});


app.get('/:listType',(req,res)=>{

  const listItem = _.capitalize(req.params.listType);

  List.findOne({name:listItem},(err,foundList)=>{
    if (!err){
      if(foundList){
        //Show an existing list
        res.render('list',{Title:foundList.name, newListItems:foundList.items,text:"New Item"});
        }
      else{

        //Create list
        const list = new List({
          name: listItem,
          items: DEFAULT_ITEMS
        });
      
        list.save();
        res.redirect(`/${listItem}`)
      }
    }

  })
})


app.post('/',(req,res)=>{
  const newItem = req.body.addTodo;
  const listName = req.body.list;

  const item = new Item({
    name: newItem
  });

  if (listName === 'Today') {
    item.save();
    res.redirect('/');
  }

  else{
    List.findOne({name:listName},(err,foundList)=>{
      foundList.items.push(item);
      foundList.save();
      res.redirect(`/${listName}`);
    });
  }
  // if(newItem.trim() === ''){
  //   res.render('list',{Title:'Today',newListItems:DEFAULT_ITEMS, text:"Can't be empty"})
  //   return
  // }

})


app.post('/delete',(req,res)=>{
  const itemName = req.body.checkbox;
  const list = req.body.listName;
  
  if (list === "Today"){
    Item.deleteOne({name:itemName},(err)=>{
      if (!err) {
        console.log('Successful');
        res.redirect('/');
      }
    });
  }
  else
  {
    List.findOne({name:list},(err,foundList)=>{
      foundList.items = foundList.items.filter((obj)=>{
        return obj.name !== itemName;
      });
      foundList.save();
      res.redirect(`/${list}`);
    })
  }
});



app.get('/about',(req,res)=>{
  res.render('about')
})


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, () => {
  console.log("Server has started successfully");
});
