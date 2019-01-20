const MongoClient = require('mongodb').MongoClient;

module.exports = {
    // Starting database connection
    // TODO: Create function header
    connect: (url, dbName) => {
        MongoClient.connect(url, function(err, client))
            mongoose.connect(`mongodb://localhost/${databaseName}`, { useNewUrlParser: true })
            .then(() => {
                console.log("Connected to mongo...\n");
                begin()
            })
            .catch(err => console.log("Failed connection to mongo ", err));
        },

    // Push data to database
    // TODO: Create function header
    pushData: (data, objectName) => {
            return new Promise((resolve, refect) => {
            var thingSchema = new mongoose.Schema({}, { strict: false });
            var DataObject = mongoose.model(objectName, thingSchema);
            data.forEach(async (toSave) => {
                var object = new DataObject(toSave);
                await object.save();
            })
    
        resolve();
        });
    },

    
    // TODO: create function header
    close: () => {
        // Handle all shutdown logic
    }
}