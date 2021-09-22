const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Users = new Schema({
    userName: String,
    password: String,
    oneToOneRoomUsersList: [
        {
            userName:String,
        }
    ],
    groupList:[
        {
            groupName:String,
            groupId:String
        }
    ],
    date: Date
});

module.exports = mongoose.model('Users', Users)