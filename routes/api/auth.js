const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const {check, validationResult} = require('express-validator');
const User = require('../../models/User');

// @route   GET api/auth
// @desc    Test route
// @access  Public
router.get('/',auth, async (req,res)=>{
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}
);



// @route   POST api/auth
// @desc    Authenticate user and get token
// @access  Private
router.post('/',[
    check('email','Please include a valid email').isEmail(),
    check('password',
    'Password is required')
    .exists()
], async (req,res)=>{
    // console.log(req.body);
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }


    const {email,password} = req.body;

    try{
            //Register user
            //See if User exists
            // console.log(User)
            let user = await User.findOne({email:email});

            if(!user){
                return res.status(400).json({
                    errors:[{
                        msg:'Invalid credentials'
                    }]
                });
            }
            

            const isMatch = await bcrypt.compare(password,user.password);


            if(!isMatch){
                return res.status(400).json({
                    errors:[{
                        msg:'Invalid credentials'
                    }]
                });
            }

            const payload = {
                user:{
                    id:user.id
                }
            };

            jwt.sign(payload,
            config.get('secretkey'),
            {expiresIn:360000},
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