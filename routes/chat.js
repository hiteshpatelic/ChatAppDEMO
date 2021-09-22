const router = require('express').Router();
const Users = require('../models/user');

router.get('/', (req, res) => {
    const userId = req.session.userId

    if(userId !== undefined){
        Users.findById(userId)
        .then(({userName, oneToOneRoomUsersList, groupList})=>{ 
            if(userId !== null )return res.render('chat', { title : 'Home page', name: `${userName}`, error : undefined, succsess: undefined, data:oneToOneRoomUsersList, groupList:groupList})
        }).catch(e=>console.log(e))

    }
    if(userId === undefined) return res.redirect('./login') 
});


module.exports = router;