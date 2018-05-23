const express = require('express')
const app = express()
const port = 1337;

const MongoClient = require('mongodb').MongoClient;

// To test locally
//const mongoUrl = "mongodb://localhost:27017/";

// To test using Docker
const mongoUrl = "mongodb://product-db:27017/";

let db;
var ObjectID = require('mongodb').ObjectID;

var kafka = require('kafka-node');


app.use(require('body-parser').json());
app.listen(port, ()=>{console.log('server started on: ' + port)});

MongoClient.connect(mongoUrl, (err, database) => {
  if(err) console.log(err);
  db = database.db('TestDb');

});


app.get('/helloWorld', (req, res) => res.send({ express: 'Hello From Express' }))

app.get('/listProducts',function(req, res){
  console.log('List Products');
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
  sendMessage(req.body);
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
});

app.put('/withdrawProductById',function(req, res){
  console.log('_id: ' +req.query._id);
  var query = { _id:  ObjectID(req.query._id) };
  var newvalues = { $set: {'available': false} };
  db.collection('Products').update(query, newvalues, function(err, result) {
    if (err) throw err;
    res.json({message:"Product is withdrawed"});
  });

});

app.delete('/product', function(req,res){
  var query = { _id:  ObjectID(req.query._id) };
  db.collection('Products').deleteOne(query, function(err, result) {
    if (err) throw err;
    res.json({message:"Product is deleted"});
  });

});

function sendMessage(messageKafka) {
  Producer = kafka.Producer;
  client = new kafka.Client('localhost:9092');

  client.on('error', function(error) {
    console.error(error);
  });

  producer = new Producer(client);

  console.log("Producer will start");

  producer.on('ready', function () {
    console.log("Producer for messages is ready");
    var sentMessage = JSON.stringify(messageKafka);

    var payload = [{
      topic: 'test',
      messages: sentMessage,
      attributes: 1 /* Use GZip compression for the payload */
    }];

    producer.send(payload, function(error, result) {
      console.info('Sent payload to Kafka: ', payload);
      if (error) {
        console.error(error);
      } else {
        var formattedResult = result[0];
        console.log('result: ', result)
      }
    });
  });
  console.log("Producer finished");
  producer.on('error', function (err) {
    console.error("Problem with producing Kafka message "+err);
  })

}//produceMessage
