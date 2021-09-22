const router = require('express').Router();
const Joi = require('joi');
const Users = require('../models/user');
const bcrypt = require("bcrypt");



var defaultValue = {title : 'Login page', layout : './login/default', error:undefined}
router.get("/", async (req, res) => {

    const userId = req.session.userId;
    if(userId !== undefined )return res.redirect('./chat')
    if(userId === undefined) return res.render('./login/login', defaultValue)
      
});


router.post('/', async(req, res) => {
    
    // * user form validation
    const loginSchema = Joi.object({
        userName: Joi.string().min(3).required(),
        password: Joi.string().required().min(6)
    })
    const {error} = loginSchema.validate(req.body);
    if(error) {
        const errorDetail = error.details[0]
        defaultValue = {...defaultValue, error: errorDetail}
        return res.render('./login/login', defaultValue)
    }

    Users.findOne({ userName: req.body.userName})
    .then(response=>{ 
        bcrypt.compare(req.body.password, response.password, (err, res) =>{
            res ? status(true, response) : status(false);
        });
    }).catch(e=>{
        const errorDetail = {}
        errorDetail.context = {'label': 'userName'};
        errorDetail.message = " User not found!, Please Register"
        defaultValue = {...defaultValue, error: errorDetail}
        return res.render('./login/login', defaultValue)
    })
    function status(value, resvalue) {
        if(value){
            req.session.userId=resvalue._id.toHexString()
            return res.redirect('./chat');
        }else{
            const errorDetail = {}
            errorDetail.context = {'label': 'password'};
            errorDetail.message = " Password not matched!"
            defaultValue = {...defaultValue, error: errorDetail}
            return res.render('./login/login', defaultValue)
        }
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy();
    return res.redirect('/')
});

module.exports = router;