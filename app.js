/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

var username = 'f6271ebc-3008-4298-95d0-13b54412ab80'
var fuckedUpUserName = '78da62a8-c1cb-48a6-8d5c-b6c80b2c9b3c-us-south'

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
  username: username,
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
      else {
        console.log(response);
        var result = new Result(response);
        toReturn = "it worked";
        done = result;
      }

        callback(result);
  });

}

function Result(response) {
  if(response.images[0].scores != undefined) {
    this.item = response.images[0].scores[0].name
    this.score = response.images[0].scores[0].score
    this.class = lookUp(response.images[0].scores[0].name)
  }

}

function deleteClassifier(classifierID) {
  visual_recognition.deleteClassifier({
  	classifier_id: classifierID },
  	function(err, response) {
  	 if (err)
  		console.log(err);
  	 else
  		console.log(JSON.stringify(response, null, 2));
  	}
  );
}

app.get('/uploadTest', function (req, res) {
    res.sendFile(__dirname + "/public/uploadTest.html");
});


app.post('/api/upload', upload.array('files'), function (req, res, next) {
    console.log(req.body);
    res.end("File is uploaded...");
    createClassifier(req.body.classifierName, "positives.zip", "negatives.zip");

});

app.get('/delete/:id', function (req, res) {
  visual_recognition.deleteClassifier({
  	classifier_id: req.params.id },
  	function(err, response) {
  	 if (err)
  		console.log(err);
  	 else {
  		console.log(JSON.stringify(response, null, 2));
      res.send(JSON.stringify(response, null, 2));
      }
  	}
  );
});

app.get('/list', function(req, res) {
  visual_recognition.listClassifiers({verbose: true},
  	function(err, response) {
  	 if (err)
  		console.log(err);
  	 else {
  		bigList = JSON.parse(JSON.stringify(response, null, 2));
      bigList = bigList.classifiers;

      for(c in bigList) {
        current = bigList[c];
        if(current.owner === fuckedUpUserName)
          console.log(bigList[c]);
      }
  	}
  });
});

function listOurs() {
  visual_recognition.listClassifiers({verbose: true},
  	function(err, response) {
  	 if (err)
  		console.log(err);
  	 else {
  		bigList = JSON.parse(JSON.stringify(response, null, 2));
      bigList = bigList.classifiers;

      for(c in bigList) {
        current = bigList[c];
        if(current.owner === fuckedUpUserName)
          console.log(bigList[c]);
      }
  	}
  });
}

app.listen(80, function () {
  console.log('Example app listening on port 80!');
});

app.post('/api/photo', upload.array('files'), function(req,res){

    // res.end("File is uploaded");
    console.log(req.files[0]);
    var result = classifyImage(req.files[0].originalname, res, function(response) {
      res.send(response);
    });

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
  return toReturn;
});
