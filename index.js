require('dotenv').config();
const express = require('express')
const router = require('./router/router')
const connectToDb = require('./utils/db')
const cors  = require("cors")
const app = express();
app.use(cors())

app.use(express.json())
// app.use(express.urlencoded({ extended: true }));

app.use("/api",router)

const PORT = process.env.PORT || 5001;

connectToDb()
.then((
    app.listen(PORT, ()=>{
        console.log(`server is running at port:- `,PORT)
    })
))
.catch((error) => {
    console.error('Error starting server:', error);
    process.exit(1); // Exit with an error code
  });
