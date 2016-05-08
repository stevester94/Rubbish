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


var classifiedStatus = {
  classified: "unwritten",
  watResClass: "unwritten",
  watResConfid: -100.100
};
//

// createCokeClassifier();

function classifyCoke(functToRun) {
  var params = {

  	images_file: fs.createReadStream('./test3.jpg'),
  	classifier_ids: fs.readFileSync('./classifierList.json')

  };

  visual_recognition.classify(params,
  	function(err, response) {
          if (err){
        		console.log(err);
            classifiedStatus = {
              classified: "No",
              watResClass :  "Unavailable",
              watResConfid : -30.333
            };

          }
          else{
     		   //  console.log(JSON.stringify(response, null, 2));
            var watsonText = (JSON.stringify(response, null, 2));
            watsonText = JSON.parse(watsonText);
            console.log("==========");
            console.log(watsonText.images[0].scores[0].name);
            console.log("=====");
            var watsonConfidence = watsonText.images[0].scores[0].score;
             console.log(watsonConfidence);

            classifiedStatus = {
              classified: "Yes",
              watResClass :  watsonText.images[0].scores[0].name,
              watResConfid : (watsonConfidence)
            };
          }




  });
//  dumpster();
  functToRun();
}
//classifyCoke();
//console.log(classifiedStatus.classified);

/*
function testObject(){
  var classifiedStatus = {
    classified: "Yes",
    watsonResponse: "YES YES YES"}
    ;
    return classifiedStatus;
}
*/
 //createTrashTier();
 var dumpster = function trashTier(){

   var watsonResult = {
     classifiedVal: "No Clue",
     watsonResponseClass: "No Clue",
     watsonResponseConfidence : -7.7

   };

   //watsonResult.classifiedVal = classified;
   //functToRun();
   watsonSays = watsonResult.classifiedVal;
   console.log("ClassifiedAbility is " + classifiedStatus.classified );
   console.log("Classified as " + classifiedStatus.watResClass );
   console.log("Confidence is " + classifiedStatus.watResConfid);

 }

classifyCoke(dumpster);
//trashTier(runner);

//classifyCoke();

// visual_recognition.classify(params,
// 	function(err, response) {
//    	 if (err)
//       		console.log(err);
//     	 else
//    		console.log(JSON.stringify(response, null, 2));
// });

// start server on the specified port and binding host

// app.get('/', function (req, res) {
//
//     res.sendFile("index.html");
// });
//
// // app.post('/')
//

// app.listen(appEnv.port, '0.0.0.0', function() {
//   // print a message when the server starts listening
//   console.log("server starting on " + appEnv.url);
// });
