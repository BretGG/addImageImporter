var mongoose = require('mongoose');
var readline = require('readline');
var fs = require('fs');
var csvParser = require('csv-parser');

// Starting database connection
function connect(databaseName){
  mongoose.connect(`mongodb://localhost/${databaseName}`, { useNewUrlParser: true })
  .then(() => {
      console.log("Connected to mongo...\n");
      begin()
   })
  .catch(err => console.log("Failed connection to mongo ", err));
}

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
        rl.question('Enter path to files (use \\ delimiter): ', (input) => {
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

        fs.createReadStream(path)
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

    let newPath = '/';
    let splitPath = path.split('\\');
    for (var i = splitPath.length - depth - 1; i < splitPath.length - 1; i++) {
        if (i == splitPath.length - depth - 1){
            newPath += splitPath[i];
        } else {
            newPath += "/" + splitPath[i];
        }
    }

    return new Promise((resolve, reject) => {
        fs.readdirSync(path).forEach(file => {
            files.push(newPath + '/' + file); 
          })
        resolve(files);
    });
}

// Push data to database
function pushData(data, objectName) {
    return new Promise((resolve, refect) => {
      var thingSchema = new mongoose.Schema({}, { strict: false });
      var DataObject = mongoose.model(objectName, thingSchema);
      data.forEach(async (toSave) => {
          var object = new DataObject(toSave);
        //   console.log(object);
          await object.save();
      })

      resolve();
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

setdataBaseName();