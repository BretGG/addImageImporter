var mongoose = require('mongoose');
var readline = require('readline');
var pathFormatter = require('path');
var fs = require('fs');
var csvParser = require('csv-parser');
const userInterface = require('./userInterface');


process.on('uncaughtException', function (exception) {
  console.log(exception);
});



// Setting up input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function begin(){
    var parsingPromises = [];
    var objectName = "";

    var getInputPromise = getInput();

    getInputPromise.then((input) => {
        console.log(`Grabbing data from ${input.csvPath} and ${input.filePath}`);
        rl.close();

        parsingPromises.push(parseCSV(input.csvPath));
        parsingPromises.push(getFilePaths(input.filePath, input.fileLayersCount));

        Promise.all(parsingPromises).then((values) => {
            var buildObjectsPromise = buildObjects(values[0], values[1]);

            buildObjectsPromise.then((data) => {
                var saving = pushData(data, input.objectName);

                saving.then(() => {
                    console.log("Finished!");
                    // process.exit();
                })
            });
        });
    });
}

// Gets input for CSV and files
function getInput() {
    return new Promise((resolve, reject) => {
      var csvPath;
      var filePath;
      var fileLayersCount;
      var objectName;

      var filePromise;


      var csvPromise = requestCSVPath();

      csvPromise.then((data) => {
        csvPath = data;
        filePromise = requestFileFolderPath();

        filePromise.then((data) => {
            filePath = data;
            fileLayerPromise = requestFileDepth();

            fileLayerPromise.then((data) => {
                fileLayersCount = parseInt(data);
                objectNamePromise = requestObjectName();

                objectNamePromise.then((data) => {
                    objectName = data;

                    resolve({csvPath: csvPath, filePath: filePath, fileLayersCount: fileLayersCount, objectName: objectName});
                });
            });
        });
      });
    })}

// Asks how many layers you want int the file path
// 0 gives only the file name
function requestFileDepth() {
    return new Promise((resolve, reject) => {
        rl.question('How many layers deep do you want the file path: ', (input) => {
            resolve(input);
        });
    });
}

// Returns string with path entered
function requestCSVPath() {
    return new Promise((resolve, reject) => {
        rl.question('Enter path to csv file: ', (input) => {
            resolve(input)
        });
    });
}

// Returns string with path entered
function requestFileFolderPath(){
    return new Promise((resolve, reject) => {
        rl.question('Enter path to files: ', (input) => {
            resolve(input);
        });
    });
}

// Returns string with path entered
function requestObjectName(){
    return new Promise((resolve, reject) => {
        rl.question('Enter name of object to be saved: ', (input) => {
            resolve(input);
        });
    });
}

function setdataBaseName() {
    rl.question("Enter name of database: ", (input) => {
        connect(input);
    });
}

// parse CSV into array of objects pertaining to the columns of the csv
// set CSV top row as header to set object keys
function parseCSV(path) {
    return new Promise((resolve, reject) => {
        var dataLines = [];

        fs.createReadStream(pathFormatter.normalize(path))
        .pipe(csvParser())
        .on('data', (data) => dataLines.push(data))
        .on('end', () => {
          dataLines = JSON.stringify(dataLines);
          dataLines = JSON.parse(dataLines);
          resolve(dataLines);
        });

    });
}

// gets array of files at the directory path
function getFilePaths(path, depth) {
    let files = [];

    let newPath = pathFormatter.sep;
    let splitPath = path.split(pathFormatter.sep);
    for (var i = splitPath.length - depth; i < splitPath.length; i++) {
        newPath = pathFormatter.join(newPath, splitPath[i]);
    }

    return new Promise((resolve, reject) => {
        fs.readdirSync(pathFormatter.normalize(path)).forEach(file => {
            if (!(/(^|\/)\.[^\/\.]/g).test(file)) {
              files.push(newPath + pathFormatter.sep + file); 
            }
          })
        resolve(files);
    });
}

// Add image link to all objects
function buildObjects(csvData, fileData) {
    return new Promise((resolve, reject) => {
        csvData.forEach((data, index) => {
            data['imgLink'] = fileData[index];
        })
        resolve(csvData);
    });
}

userInterface.mainMenu();
// userInterface.askPath("something");