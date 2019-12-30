
const express = require('express');
const app = express();
const fs = require('fs');
const formidable = require('formidable');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const ObjectID = require('mongodb').ObjectID;
// your mongourl doesn't work!!!
const mongourl = 'mongodb+srv://albert:albertlai@s12117948-nxlom.azure.mongodb.net/test?retryWrites=true&w=majority';
// check your db name
const dbName = 'Project';
app.set('view engine', 'ejs');
//const bodyParser = require('body-parser');
//app.use(bodyParser.json());
//app.use(express.static('public'));
//app.use(bodyParser.urlencoded({extend: true}));

var restaurant = {
      name : ' ' ,
      borough : '',
      cuisine : '', 
      street : '',
      building : '',
      zipcode : '',
      latitude : '',
      longitude : '',
      owner : '' ,
	  photo : ''
};

app.get('/',(req,res) => {
    res.render('upload');
})

app.post('/upload', function(req,res){
    /*
    var name = req.body.name;
    var borough = req.body.borough;
    var cuisine = req.body.cuisine;
    var street = req.body.street;
    var building = req.body.building;
    var zipcode = req.body.zipcode;
    var latitude = req.body.latitude;
    var longitude = req.body.longitude;
    var owner = req.body.owner;
    */
    var form = new formidable.IncomingForm();
    form.parse(req,(err,fields,files) => {
        console.log(fields.name);
        restaurant.name = fields.name;
        restaurant.borough = fields.borough;
        restaurant.cuisine = fields.cuisine;
        restaurant.street = fields.street;
        restaurant.building = fields.building;
        restaurant.zipcode = fields.zipcode;
        restaurant.latitude = fields.latitute;
        restaurant.longitude = fields.longitude;
        restaurant.owner = fields.owner;
		restaurant.photo = fs.readFile(files.filetoupload.path);
		const img =  fs.readFile(files.filetoupload.path);
        const format = img.toString('base64');
		
        
      

        const client = new MongoClient(mongourl);
        client.connect((err) => {
            assert.equal(null,err);
            console.log("Connected successfully to mongodb server");
            const db = client.db(dbName);
            db.collection('albert').insertOne(albert,(err, result) => {
                assert.equal(err, null);
                console.log("1 document inserted.");
                client.close();
            });
        });
    });
})




app.get('/display', (req,res) => {
  
  
const findRestaurants = (db, callback) => {
let cursor = db.collection('restaurant')
.find()
cursor.forEach((doc) => {
console.log(JSON.stringify(doc));
});
callback();
};


  
  
  
  
  
  let client = new MongoClient(mongourl);
  client.connect((err) => {
    try {
      assert.equal(err,null);
    } catch (err) {
      res.status(500).end("MongoClient connect() failed!");
    }      
    console.log('Connected to MongoDB');
    const db = client.db(dbName);
    //let criteria = {};
   // criteria['_id'] = ObjectID(req.query._id);
    findRestaurant(db,(restaurant) => {
      client.close();
      console.log('Disconnected MongoDB');
  console.log("Connected successfully to server");
const db = client.db(dbName);
findRestaurants(db,() => {
client.close();
})
    })
  
  
  
  });
});

app.get('/delete', (req,res) => {
/*let obj = {};
try {
	obj = JSON.parse();
}
catch(err){
	console.log(`Invalid `);
}
	*/
	const client = new MongoClient(mongourl);
	client.connect((err) => {
	try{
		assert.equal(null,error)
	}
	catch(err){
		console.log(`Invalid `);
	}
	const db = client.db(dbName);
	db.collection('albert').delete(_id = 5de277656a157529b1bd28ff,(err,result) => {
		console.log(result);
		
	});
	});
});






/*const findRestaurants = (db, max, callback) => {
	cursor = db.collection('restaurant').find().limit(max); 
	cursor.toArray((err,docs) => {
		assert.equal(err,null);
		//console.log(docs);
		callback(docs);
	});
}*/
app.listen(process.env.POST || 8099);
