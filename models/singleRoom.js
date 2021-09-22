const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SingleRoom = new Schema({
    room:{
        users: {type:Array, default: []},
        conversion:[
            {
                sender: {type:String},
                messgae: {type:String},
                date:  Date
            }
        ],
    }
});

module.exports = mongoose.model('SingleRoom', SingleRoom)