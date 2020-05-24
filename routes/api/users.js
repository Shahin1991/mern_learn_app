const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const {check, validationResult} = require('express-validator');
const User = require('../../models/User');

// @route   GET api/users
// @desc    Test route
// @access  Public
router.get('/',(req,res)=>res.send('User route'));




// @route   POST api/users
// @desc    Register User
// @access  Public
router.post('/',[
    check('name','name is required')
    .not().
    isEmpty(),
    check('email','Please include a valid email').isEmail(),
    check('password',
    'Please enter a password with 6 or more characters')
    .isLength({min:6})
], async (req,res)=>{
    console.log(req.body);
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }


    const {name,email,password} = req.body;

    try{
            //Register user
            //See if User exists
            console.log(User)
            let user = await User.findOne({email:email});

            if(user){
                return res.status(400).json({
                    errors:[{
                        msg:'User already exists'
                    }]
                });
            }
            //Get user gravatar

            const avatar = gravatar.url(email,{
                s:"200",
                r:"pg",
                d:'mm'
            })

            user = new User({
                name:name,
                email:email,
                password:password,
                avatar:avatar
            })

            //Encrypt password
            const salt  = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password,salt)
            await user.save();


            //return json webtoken - for immediate login after registration

            const payload = {
                user:{
                    id:user.id
                }
            };

            jwt.sign(payload,
            config.get('secretkey'),
            {expiresIn:36000},
            (err,token)=>{
                if(err){
                    throw err;
                }
                res.json({token});
            }
            )

            //res.send('User registered');
    }
    catch(err){
        console.log(err)
        res.status(500).send('Server Error')
    }
  
});

module.exports= router; 