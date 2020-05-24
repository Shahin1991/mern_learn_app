const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const request = require('request');
const config = require('config');

const {check,validationResult} = require('express-validator');

const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');


// @route   GET api/profile/me
// @desc    Get current user profile
// @access  Private
router.get('/me',auth,async (req,res)=>{
    try {
        console.log('GET api/profile/me called')
        const profile = await Profile.findOne({user:req.user.id})
        


        if(!profile){
            res.status(400).json({msg:"There is no profile for this user"})
        }

        res.json(profile.populate('user',['name','avatar']));

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error')
    }
});
 

// @route   POST api/profile
// @desc    Create or update a user profile
// @access  Private

router.post('/',[auth,
    [
        check('status','Status is required').not().isEmpty(),
        check('skills','Skills is required').not().isEmpty()
    ]
],
async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }

    const {
        company,
        location,
        website,
        bio,
        skills,
        status,
        githubusername,
        youtube,
        twitter,
        instagram,
        linkedin,
        facebook
      } = req.body;


    const profileFields = {};
    profileFields.user = req.user.id;
    if(company) profileFields.company = company;
    if(website)profileFields.website = website;
    if(location)profileFields.location = location;
    if(bio)profileFields.bio = bio;
    if(status)profileFields.status = status;
    if(githubusername)profileFields.githubusername = githubusername;
    if(skills){
        profileFields.skills = skills.split(',').map(skill=>skill.trim());
    }

    // build social object

    profileFields.social = {}
    if(youtube) profileFields.social.youtube;
    if(twitter) profileFields.social.twitter;
    if(facebook) profileFields.social.facebook;
    if(linkedin) profileFields.social.linkedin;
    if(instagram) profileFields.social.instagram;

    try {
        
        let profile = await Profile.findOne({user:req.user.id});

        if(profile){
            //Update
            profile = await Profile.findOneAndUpdate(
                {user:req.user.id},
                {$set:profileFields},
                {new:true}
                );

            return res.json(profile);
        }

        //Create
        profile = new Profile(profileFields);

        await profile.save()
        return res.json(profile);

    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
}
);




// @route   GET api/profile
// @desc    Get all profile
// @access  Public
router.get('/',async(req,res)=>{
    try {
        const profiles = await Profile.find().populate('user',['name','avatar']);
        
        res.json(profiles);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error')
    }
})
 

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user id
// @access  Public
router.get('/user/:user_id',async(req,res)=>{
    try {
        const profile = await Profile.findOne({user:req.params.user_id}).populate('user',['name','avatar']);
        
        if(!profile){
            return res.status(400).json({msg:'Profile not found'})
        }
        
        res.json(profile);
    } catch (error) {
        console.error(error);
        if(error.kind=='ObjectId'){
            return res.status(400).json({msg:'Profile not found'})
        }
        res.status(500).send('Server Error')
    }
})

// @route   DELETE api/profile
// @desc    delete profile, user and posts
// @access  Private
router.delete('/',auth,async(req,res)=>{
    try {
        //todo - remove users posts
        await Post.deleteMany({user:req.user.id})
        //remove profile
        await Profile.findOneAndRemove({user:req.user.id})
        //remove user
        await User.findOneAndRemove({_id:req.user.id})
        
        res.json({msg:'User deleted'});
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error')
    }
})


// @route   PUT api/profile/experience
// @desc    Add profile experience
// @access  Private
router.put('/experience',[auth,[
    check('title','Title is required').not().isEmpty(),
    check('company','Company is required').not().isEmpty(),
    check('from','From Date is required').not().isEmpty()
]],async(req,res)=>{
    try {
      const errors = validationResult(req);
      if(!errors.isEmpty()){
          return res.status(400).json({errors:errors.array()});
      }
      const {
          title,
          company,
          location,
          from,
          to,
          current,
          description
      } = req.body;


      const newExp = {
          title,
          company,
          location,
          from,
          to,
          current,
          description
      }

      const profile = await Profile.findOne({user:req.user.id});

      //push onto the beginning
      profile.experience.unshift(newExp);
      await profile.save();
      res.json(profile);

    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error')
    }
})


// @route   Delete api/profile/experience/:exp_id
// @desc    Delete profile experience
// @access  Private
router.delete('/experience/:exp_id',auth,async(req,res)=>{
    try{
        const profile = await Profile.findOne({user:req.user.id});

        //get the experience to remove
        const removeIndex = profile.experience
        .map(item=>item.id)
        .indexOf(req.params.exp_id);

        profile.experience.splice(removeIndex,1);

        await profile.save();

        res.json(profile);
    }
    catch(error){
        console.error(error);
        res.status(500).send('Server Error')
    }
})

// @route   PUT api/profile/education
// @desc    Add profile education
// @access  Private
router.put('/education',[auth,[
    check('school','School is required').not().isEmpty(),
    check('degree','Degree is required').not().isEmpty(),
    check('fieldofstudy','Field of Study is required').not().isEmpty(),
    check('from','From Date is required').not().isEmpty()
]],async(req,res)=>{
    try{
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            res.status(400).json({errors:errors.array()})
        }

        const {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        } = req.body

        const newEd = {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        }

        const profile = await Profile.findOne({user:req.user.id})

        profile.education.unshift(newEd);
        await profile.save();
        res.json(profile)

    }
    catch(error){
        console.error(error);
        res.status(500).send('Server Error');
    }
})

// @route   Delete api/profile/experience/:exp_id
// @desc    Delete profile experience
// @access  Private
router.delete('/education/:ed_id',auth,async(req,res)=>{
    try{
        const profile = await Profile.findOne({user:req.user.id});

        if(profile){
            const removeIndex = profile.education
            .map(item=>item._id)
            .indexOf(req.params.ed_id);

            profile.education.splice(removeIndex,1);
            await profile.save();
            res.json(profile);
        }
        else{
            res.status(400).send('Profile not found');
        }
    }
    catch(error){
        console.error(error);
        res.status(500).send('Server Error');
    }
})

// @route   GET api/profile/github/:username
// @desc    Get github userrepos
// @access  Public
router.get('/github/:username',(req,res)=>{
    try{
        const options={
            url:`http://api.github.com/users/${req.params.username}/repos?per_page=5
            &sort=created:asc&client_id=${config.get('githubClientId')}
            &client_secret=${config.get('githubSecret')}`,
            method:'GET',
            headers:{'user-agent':'node.js'},
        }

        request(options,(error,response,body)=>{
            if(error){
                console.error(error);
            }
            if(response.statusCode!==200){
                return res.status(400).json({msg:'No Github profile found'});
            }
            res.json(JSON.parse(body));
        })
    }
    catch(error){
        console(error);
        res.status(500).send('Server Error');
    }
})

module.exports= router;