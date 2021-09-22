const router = require('express').Router();
const Users = require('../models/user');
const SingleRoom = require('../models/singleRoom');
const GroupRoom = require('../models/groupRoom');



router.post('/addContact', async (req, res) => {
    const data = req.body.userName.trim()
    if(data === "") {
        sendResponse(req,res,{addContact:"Please enter some value"}, undefined)
    }else{
        const cursor =  await Users.findOne({userName : req.body.userName});
        if(cursor === null ){
            sendResponse(req,res,{addContact: "Contact not found"},undefined)              
        } else{
            const userId = req.session.userId
            if(userId !== undefined){

                const authorName = await Users.findById(userId);
                const message = new SingleRoom({
                    room:{
                        users:[authorName.userName,req.body.userName]
                    }
                })

                await message.save()
               
                const findContactExsist = await Users.findById(userId);
                const result = findContactExsist.oneToOneRoomUsersList.find(e=>e.userName === req.body.userName)
                if(!result){
                    const result = await Users.updateOne({_id: userId}, 
                        {$push:{oneToOneRoomUsersList:[ { userName: req.body.userName}]} }
                    )
                    if(result){
                        sendResponse(req,res,undefined, {addContact:"Contact added"})
                    }else{
                        sendResponse(req,res,undefined, {addContact:"Somthing went wrong please try again"})
                    }
            }else{
                    sendResponse(req,res,{addContact: "Contact alredy Exist"},undefined) 
                }
            }
        }
    }
});



function sendResponse(req, res,error, succsess){
    const userId = req.session.userId
    if(userId !== undefined){
        Users.findById(userId)
        .then(({userName, oneToOneRoomUsersList, groupList})=>{ 
            let resObject = { title : 'Home page', name: `${userName}`, error:error, succsess:succsess, data:oneToOneRoomUsersList, groupList:groupList}
            if(userName)return res.render('chat', resObject)
        }).catch(e=>console.log(e))
    }
    if(userId === undefined) return res.redirect('./login') 
}


router.post('/createGroup', async(req, res) => {

    // * if admin want limits of creating group it's possible here 
    const data = req.body.groupName.trim()
    if(data === "")return sendResponse(req,res,{groupCreationError:"Please enter some value"}, undefined)
    const userId = req.session.userId
    if(userId !== undefined){
        const getUser = await Users.findById(req.session.userId).select('userName');
        if(getUser){
            const createGroup = new GroupRoom({
                room:{
                    groupName:req.body.groupName,
                    users:[getUser.userName]
                }
            })
            const createGroupResult = await createGroup.save()
            const storeInUserGroupList = await Users.findByIdAndUpdate(req.session.userId, {$push:{groupList:[ { groupName:req.body.groupName, groupId: createGroupResult._id  }]} })
            
            if(!createGroupResult || !storeInUserGroupList) return sendResponse(req,res,{groupCreationError:"Somthing went wrong!"}, undefined)
            if(createGroupResult.room.groupName === req.body.groupName)return sendResponse(req,res, undefined, {groupCreationDone:`${createGroupResult.room.groupName} is created...`})
        }
    }
    if(userId === undefined) return res.redirect('./login')
});


router.get('/joinGroup', async(req, res) => {
    const {roomID, roomName} =req.query
    if(!roomID && !roomName ) return res.send('not valid group link');

    const findUserAlreadyIngroup = await Users.findOne({$and:[{_id: req.session.userId}, {'groupList.groupId': roomID}]})

    if(findUserAlreadyIngroup) return sendResponse(req,res,{groupCreationError:"You are already in Group!"}, undefined)
    if(!findUserAlreadyIngroup){

        const addGroupOnUserList = await Users.findByIdAndUpdate(req.session.userId, {$push:{groupList:[ { groupName:roomName, groupId: roomID  }]} })
        const addUserOnGroupUserList = await GroupRoom.findByIdAndUpdate(roomID, {$push:{"room.users": addGroupOnUserList.userName} })

        if(!addGroupOnUserList && !addUserOnGroupUserList) return sendResponse(req,res,{groupCreationError:"Somthing went wrong!"}, undefined)
        if(addGroupOnUserList && addUserOnGroupUserList) return sendResponse(req,res, undefined, {groupCreationDone:` You are the member of ${roomName} Group ...`})
    }
});

module.exports = router;
