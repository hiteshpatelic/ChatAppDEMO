const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GroupRoom = new Schema({
    room:{
        groupName:{type:String},
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

module.exports = mongoose.model('GroupRoom', GroupRoom)