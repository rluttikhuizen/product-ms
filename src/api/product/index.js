const express = require('express')
const app = express()
const port = 1337;

const MongoClient = require('mongodb').MongoClient;
const mongoUrl = "mongodb://localhost:27017/";
let db;
var ObjectID = require('mongodb').ObjectID;

app.use(require('body-parser').json());
app.listen(port, ()=>{console.log('server started on: ' + port)});

MongoClient.connect(mongoUrl, (err, database) => {
  if(err) console.log(err);
  db = database.db('ProductsDB');

});


app.get('/helloWorld', (req, res) => res.send('Hello World!'))

app.get('/listProducts',function(req, res){

  db.collection('Products').find().toArray((err, result) => {
    if (err) return console.log(err);
    res.json(result);
  });

});

app.get('/productById',function(req, res){
  console.log('productId: ' +req.query.productId);
  var query = { productId: parseInt(req.query.productId) };
  db.collection('Products').findOne(query, function(err, result) {
       res.json(result);
    });

});

app.post('/product', function(req, res){
  console.log(req.body);

  db.collection('Products').save(req.body, (err, result) => {
    if (err) return console.log(err);
    console.log('saved to database');
    res.json({message:"Product is saved"});
  });

});

app.put('/product', function(req,res){
  console.log(req.body);
  console.log('id: ' + req.body._id);
  var query = { '_id': ObjectID(req.body._id) };
  var newvalues = { $set: {'productName': req.body.productName, 'price': req.body.price } };
  db.collection('Products').update(query, newvalues, function(err, result) {
    if (err) throw err;
    res.json({message:"Product is updated"});
  });
})
