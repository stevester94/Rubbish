/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();

// for multipart uplaods
var multer = require("multer");
var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    console.log(file);
    callback(null, './uploads');
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  }
});
var upload = multer({ storage : storage});
// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

var watson = require('watson-developer-cloud');
var fs = require('fs');

var visual_recognition = watson.visual_recognition({
  username: 'f6271ebc-3008-4298-95d0-13b54412ab80',
  password: 'Fsjwwu5RPYMf',
  version: 'v2-beta',
  version_date: '2015-12-02'
});

// positivesName should always be positives.zip
// negativesName should always be negatives.zip
function createClassifier(classifierName, positivesName, negativesName) {
  var params = {
  	name: classifierName,
  	positive_examples: fs.createReadStream('./uploads/' + positivesName),
  	negative_examples: fs.createReadStream('./uploads/' + negativesName)
  };

  visual_recognition.createClassifier(params,
  	function(err, response) {
     	 if (err)
        		console.log(err);
      	 else
     		console.log(JSON.stringify(response, null, 2));
  });
}

function lookUp(item) {
  switch (item) {
  case "coke":
    return "Recycle";
    
  }
  
  return "Not Found"
}


var done = false;

function classifyImage(name, res, callback) {
  var params = {
  	images_file: fs.createReadStream('./uploads/' + name),
  	classifier_ids: fs.readFileSync('./classifierList.json')
  };

  var toReturn = "hello";
  visual_recognition.classify(params,
  	function(err, response) {
     	if (err)
          console.log(err);
      else
     		  console.log(response);
          var result = new Result(response);
          toReturn = "it worked";
          done = result;
          callback(toReturn);
  });
  
}

function Result(response) {
  if response.image[0].scores != undefined {
    this.item = response.images[0].scores[0].name
    this.score = response.images[0].scores[0].score
    this.class = lookUp(response.images[0].scores[0].name)
  }
 
}

app.get('/uploadTest', function (req, res) {
    res.sendFile(__dirname + "/public/uploadTest.html");
});

app.post('/api/upload', upload.array('files'), function (req, res, next) {
    console.log(req.body);
    res.end("File is uploaded...");

    createClassifier(req.body, "positives.zip", "negatives.zip");

});

app.post('/api/photo', upload.array('files'), function(req,res){
    
    // res.end("File is uploaded");
    console.log(req.files[0]);
    var result = classifyImage(req.files[0].originalname, res, function(response) {
      res.send("it worked");
    });
    
  
    
});


app.listen(3000, function () {
  console.log('Example app listening on port 80!');
});