const router = require('express').Router();
const Joi = require('joi');
const Users = require('../models/user');
const bcrypt = require("bcrypt");

var defaultValue = {title : 'Sign Up page', layout : './register/default', error:undefined}

router.get("/", (req, res) => {
    res.render('./register/register', defaultValue )
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
        // res.json(defaultValue)
        return res.render('./register/register', defaultValue)
    }

    // * find username is exist or not
    const findUsername  = await Users.findOne({ userName: req.body.userName }).exec();
    if(findUsername) {
        const errorDetail = {}
        errorDetail.context = {'label': 'userName'};
        errorDetail.message = " User name alredy taken please chose another one"
        defaultValue = {...defaultValue, error: errorDetail}
        // res.json(defaultValue)
        return res.render('./register/register', defaultValue)
    }

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, salt);
    
    const user = new Users({
        userName : req.body.userName,
        password : password
    })

    const result = await user.save()
    
    // * store data in redis
    if (result) {
        req.session.userId= result._id.toHexString()
        res.redirect('./chat');
    }else{
        const errorDetail = {}
        errorDetail.context = {'label': 'userName'};
        errorDetail.message = " User not created server error"
        defaultValue = {...defaultValue, error: errorDetail}
        // res.json(defaultValue)
        return res.render('./register/register', defaultValue)
    }
});


module.exports = router;