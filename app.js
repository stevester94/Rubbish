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
    callback(null, 'uploads');
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

function createCokeClassifier() {
  var params = {
  	name: 'coke',
  	positive_examples: fs.createReadStream('./Coke.zip'),
  	negative_examples: fs.createReadStream('./notCoke.zip')
  };

  visual_recognition.createClassifier(params,
  	function(err, response) {
     	 if (err)
        		console.log(err);
      	 else
     		console.log(JSON.stringify(response, null, 2));
  });
}

// createCokeClassifier();

function classifyCoke() {
  var params = {
  	images_file: fs.createReadStream('./test4.jpg'),
  	classifier_ids: fs.readFileSync('./classifierList.json')
  };

  visual_recognition.classify(params,
  	function(err, response) {
     	 if (err)
        		console.log(err);
      	 else
     		console.log(JSON.stringify(response, null, 2));
  });
}

//classifyCoke();

// visual_recognition.classify(params,
// 	function(err, response) {
//    	 if (err)
//       		console.log(err);
//     	 else
//    		console.log(JSON.stringify(response, null, 2));
// });

// start server on the specified port and binding host

app.get('/uploadTest', function (req, res) {
    res.sendFile(__dirname + "/public/uploadTest.html");
});

app.post('/api/upload',function(req,res){
    upload(req,res,function(err) {
        if(err) {
            console.log(err);
            return res.end("Error uploading file.");
        }

        console.log(req.body);
        res.end("File is uploaded...");
    });
});

app.listen(80, function () {
  console.log('Example app listening on port 80!');
});
