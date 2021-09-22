const router = require('express').Router();
const SingleRoom = require('../models/singleRoom');
const GroupRoom = require('../models/groupRoom')
const Users = require('../models/user');
const Cryptr = require('cryptr');
const cryptr = new Cryptr('%F7p#2!s$8NreUH');

router.post('/storeMessage', async(req, res) => {

    const {receiver, author, messageData} = req.body
    if(!receiver && !author  && !messageData) return res.json({messgae: "please give valid data"});

    const encryptedString = cryptr.encrypt(req.body.messageData);
    const findRoom = await SingleRoom.findOne({$or: [{"room.users": {$all: [ [author, receiver ] ]} },{"room.users": {$all: [ [receiver, author ] ]} } ]});
    
    const getREciverContacts = await Users.findOne({userName: receiver})
    const filterdList = getREciverContacts.oneToOneRoomUsersList.filter(e=> e.userName===author)
    if(filterdList[0] === undefined){
        // * auto contact add on reciver
        await Users.findOneAndUpdate({userName:receiver}, {$push:{oneToOneRoomUsersList:[ { userName: author}]} })
    }
    if(findRoom){
        SingleRoom.findByIdAndUpdate(findRoom._id.toHexString(), {$push:{"room.conversion":{
            sender: author,
            messgae: encryptedString
        }}},(error)=>{
            if(error) return res.json(error);
            res.json("ok")
        })
    }
});

router.post('/storeGroupMessage', async(req, res) => {

    const { author, messageData, roomID} = req.body
    if(!roomID && !author  && !messageData ) return res.json({messgae: "please give valid data"});
    const encryptedString = cryptr.encrypt(req.body.messageData);
    try{
        GroupRoom.findByIdAndUpdate(roomID, {$push:{"room.conversion":{
            sender: author,
            messgae: encryptedString
        }}},(error)=>{
            if(error) return res.json(error);
            res.json("ok")
        })
    }catch(e){
        console.log(e);
    }

});
router.post('/getUserMessage', async(req, res) => {
    const {author, receiver} = req.body
    const findRoom = await SingleRoom.findOne({$or: [{"room.users": {$all: [ [author, receiver ] ]} },{"room.users": {$all: [ [receiver, author ] ]} } ]});
    if(findRoom !== null){
        const {room} = findRoom
        let responseData = {
            roomId : findRoom._id.toHexString()
        }
        let dycryptedMessage = []
        for(let i=0; i<room.conversion.length; i++){
            dycryptedMessage.push({
                sender: room.conversion[i].sender,
                messgae: cryptr.decrypt(room.conversion[i].messgae),
                _id: room.conversion[i]._id
            })
            
        }
        responseData.dycryptedMessage = dycryptedMessage
        return res.json( responseData)
    }
    if(findRoom === null)  return res.json([])
});

router.post('/getGroupMessages', async(req, res) => {
    const url = require('../app');
    const {roomID} = req.body
    if(!roomID) return res.send("enter valid room ID")

    const getGroupMessages = await GroupRoom.findById(roomID);
    if(getGroupMessages !== null){
        const {room} = getGroupMessages
        let responseData = {
            users : room.users,
            roomID : getGroupMessages._id.toHexString(),
            url
        }
        let dycryptedMessage = []
        for(let i=0; i<room.conversion.length; i++){
            dycryptedMessage.push({
                sender: room.conversion[i].sender,
                messgae: cryptr.decrypt(room.conversion[i].messgae),
                _id: room.conversion[i]._id
            })
        }
        responseData.dycryptedMessage = dycryptedMessage
        return res.json( responseData)
    }
    if(getGroupMessages === null) return res.json([])
});

module.exports = router;