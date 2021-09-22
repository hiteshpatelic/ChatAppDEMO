const mongoose = require('mongoose');
require('dotenv').config()

function connecctDB (){

    // * DB connection String
    mongoose.connect(process.env.DB_CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
    }, (err)=>{
        if(err) console.log('DB connection Error' + err)
        if(!err) console.log('DB conection succsessfully ');
    });
}
module.exports = connecctDB;