const http = require('http');
const url = require('url');
const fs = require('fs');
const formidable = require('formidable');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const ObjectID = require('mongodb').ObjectID;
const mongourl = 'mongodb+srv://student:g79k87@g1211540-9eqtw.mongodb.net/test?retryWrites=true&w=majority';
const dbName = 'Individual';
const express = require('express');
const app = express();
var ExifImage = require('exif').ExifImage;
var ddlat = 0;
var ddlong = 0;
var zoom = 18; 
 


const server = http.createServer((req, res) => {
  let timestamp = new Date().toISOString();
  console.log(`Incoming request ${req.method}, ${req.url} received at ${timestamp}`);

  let parsedURL = url.parse(req.url,true); // true to get query as object
  
  if (parsedURL.pathname == '/fileupload' && 
      req.method.toLowerCase() == "post") {
    // parse a file upload
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
      // console.log(JSON.stringify(files));
      if (files.filetoupload.size == 0) {
        res.writeHead(500,{"Content-Type":"text/plain"});
        res.end("No file uploaded!");  
      }
      const filename = files.filetoupload.path;
      let title = "untitled";
      //
      let description = "n/a"
      //
      let mimetype = "images/jpeg";
      if (fields.title && fields.title.length > 0) {
        title = fields.title;
      }
      //
      if (fields.description && fields.description.length > 1) {
        description = fields.description;
      }
      //
      if (files.filetoupload.type) {
        mimetype = files.filetoupload.type;
      }
      fs.readFile(files.filetoupload.path, (err,data) => {
        let client = new MongoClient(mongourl);
        client.connect((err) => {
          try {
              assert.equal(err,null);
            } catch (err) {
              res.writeHead(500,{"Content-Type":"text/plain"});
              res.end("MongoClient connect() failed!");
              return(-1);
          }
          const db = client.db(dbName);
          let new_r = {};
          new_r['title'] = title;
          //
          new_r['description'] = description;
          //
          new_r['mimetype'] = mimetype;
          new_r['image'] = new Buffer.from(data).toString('base64');
          insertPhoto(db,new_r,(result) => {
            client.close();
            res.writeHead(200, {"Content-Type": "text/html"});
            res.write('<html><body>Photo was inserted into MongoDB!<br>');
            res.end('<a href="/photos">Back</a></body></html>')
          })
        });
      })
    });
  } else if (parsedURL.pathname == '/photos') {
    let client = new MongoClient(mongourl);
    client.connect((err) => {
      try {
          assert.equal(err,null);
        } catch (err) {
          res.writeHead(500,{"Content-Type":"text/plain"});
          res.end("MongoClient connect() failed!");
          return(-1);
      }      
      console.log('Connected to MongoDB');
      const db = client.db(dbName);
      findPhoto(db,{},(photos) => {
        client.close();
        console.log('Disconnected MongoDB');
        res.writeHead(200, {"Content-Type": "text/html"});			
        res.write('<html><head><title>Photos</title></head>');
        res.write('<body><H1>Photos</H1>');
        res.write('<H2>Showing '+photos.length+' document(s)</H2>');
        res.write('<ol>');
        for (i in photos) {
          res.write('<li><a href=/display?_id='+
          photos[i]._id+'>'+photos[i].title+'</a></li>');
        }
        res.write('</ol>');
        res.end('</body></html>');
      })
    });
  } else if (parsedURL.pathname == '/display') {
    let client = new MongoClient(mongourl);
    client.connect((err) => {
      try {
        assert.equal(err,null);
      } catch (err) {
        res.writeHead(500,{"Content-Type":"text/plain"});
        res.end("MongoClient connect() failed!");
        return(-1);
      }
      console.log('Connected to MongoDB');
      const db = client.db(dbName);
      let criteria = {};
      criteria['_id'] = ObjectID(parsedURL.query._id);
      findPhoto(db,criteria,(photo) => {
        client.close();
        console.log('Disconnected MongoDB');
        console.log('Photo returned = ' + photo.length);
        let image = new Buffer.from(photo[0].image,'base64');
        console.log(image);
        new ExifImage({ image : image }, function (err, exifData) {
        if (err)
        console.log('Error :' + err.message);
        else { 
        console.log(exifData);
        }
        var exifimage = exifData.image;
        console.log(exifData);
        var make = exifimage.Make;
        console.log(make);
        var model = exifimage.Model;
        console.log(model);
        var exifexif = exifData.exif;
        var create = exifexif.CreateDate;
        console.log(create);
        var exifgps = exifData.gps;
        var lat = exifgps.GPSLatitude;
        var lad = lat[0];
        var lam = lat[1];
        var lats = lat[2];
         ddlat = lad + (lam/60) + (lats/3600);
        console.log(lat);
        console.log(lad);
        console.log(ddlat);
        var long = exifgps.GPSLongitude;
        var longd = long[0];
        var longm = long[1];
        var longs = long[2];
        ddlong = longd + (longm/60) + (longs/3600);
        console.log(long);
        console.log(longd);
        console.log(ddlong);

       
        res.writeHead(200, 'text/html');
        res.write('<html><head><style>img{max-width:30%;height:auto;max-height:30%;}</style></head><body>');
        if (photo[0].title) {
          res.write(`<html><body><center><h1>${photo[0].title}</h1></center>`);
        }
        if (photo[0].description) {
          res.write(`<html><body><center><h2>${photo[0].description}</h2></center>`);
        }
        res.write(`<center><img src="data:${photo[0].mimetype};base64, ${photo[0].image}"></center>`);
        //res.write('<img src="data:image/gif;base64,R0lGODlhEAAOALMAAOazToeHh0tLS/7LZv/0jvb29t/f3//Ub//ge8WSLf/rhf/3kdbW1mxsbP//mf///yH5BAAAAAAALAAAAAAQAA4AAARe8L1Ekyky67QZ1hLnjM5UUde0ECwLJoExKcppV0aCcGCmTIHEIUEqjgaORCMxIC6e0CcguWw6aFjsVMkkIr7g77ZKPJjPZqIyd7sJAgVGoEGv2xsBxqNgYPj/gAwXEQA7">');
        res.write(`<html><body><center><h2>Make:${make}</h2></center>`);
        res.write(`<html><body><center><h2>Model:${model}</h2></center>`);
        res.write(`<html><body><center><h2>Create:${create}</h2></center>`);
        res.write(`<html><body><center><h2>Location:<a href="/Map">Map</a></h2></center>`);
res.write('<script>');
res.write(`showPosition();`);
res.write('</script>');
        res.end('</body></html>');
       })
      });
    });
  }else if (parsedURL.pathname == '/Map'){
        console.log(ddlat);
        console.log(ddlong);
        res.writeHead(200, 'paint/html');
        res.write('<html><head><link rel="stylesheet" href="https://unpkg.com/leaflet@1.5.1/dist/leaflet.css"');
        res.write('integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=="');
	res.write('crossorigin=""/>');
        res.write('<script> src="https://unpkg.com/leaflet@1.5.1/dist/leaflet.js"'); 
        res.write('integrity="sha512-GffPMF3RvMeYyc1LWMHtK8EbPv0iNZ8/oTtHPx9/cc2ILxQ+u905qIwdpULaqDkyBKgOaB57QTMg7ztg8Jm2Og=="');
        res.write('crossorigin=""> </script></head>');
        res.write(`<body><div id = "map" style= "width: 900px; height:580px;"></div>`);
        res.write('<script>');
        res.write(` var mapOptions = { center: [${ddlat},${ddlong}], zoom: ${zoom} } `);
        res.write(`var map = new L.map('map', mapOptions);`);
        res.write(`var layer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');`);
        res.write(`map.addLayer(layer);`);
        res.write(`var marker = L.marker([${ddlat},${ddlong}]);`);
        res.write(`marker.addTo(map);`);
        
 
 

res.write(`showPosition();`);

//res.write(`<center><img src="${img_url};base64, ${photo[0].image}"></center>`);

res.write('</script>');
        res.write('hi');
res.write(`${ddlat}`);
res.write(`${ddlong}`);
res.write(`${zoom} `);
        res.end('</body></html>');
}
    else {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
    res.write('Title: <input type="text" name="title"><br>');
    //
    res.write('Description: <input type="text" name="description"><br>');
    //
    res.write('<input type="file" name="filetoupload"><br>');
    res.write('<input type="submit">');
    res.write('</form>');
    res.end();
  }
});

function showPosition() {
  var latlon = ddlat + "," + ddlong;

  var img_url = "https://maps.googleapis.com/maps/api/staticmap?center="+latlon+"&zoom=14&size=400x300&sensor=false&key=YOUR_KEY";

  document.getElementById("mapholder").innerHTML = "<img src='"+img_url+"'>";
}


const insertPhoto = (db,r,callback) => {
  db.collection('photo').insertOne(r,(err,result) => {
    assert.equal(err,null);
    console.log("insert was successful!");
    console.log(JSON.stringify(result));
    callback(result);
  });
}

const findPhoto = (db,criteria,callback) => {
  const cursor = db.collection("photo").find(criteria);
  let photos = [];
  cursor.forEach((doc) => {
    photos.push(doc);
  }, (err) => {
    // done or error
    assert.equal(err,null);
    callback(photos);
  })
}

server.listen(process.env.PORT || 8099);

