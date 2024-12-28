const mongoose = require('mongoose')

const URI = process.env.MONGODB_URI
// mongoose.connect(URI)

// const client = new MongoClient(URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
//   });

const connectDb = async () => {
    try {
        mongoose.connect(URI,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: "event-exhibition",
            authSource: "admin"
        })
        console.log('connected successfully');
    }
    catch (error) {
        console.error("database connection failed");
        process.exit(0)
    }
}

module.exports = connectDb