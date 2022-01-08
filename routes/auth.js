const router = require('express').Router()
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

//REGISTER
router.post("/register", (req, res) => {
    bcrypt.hash(req.body.password, 10, async function(err, hashedPassword){
        if (err) {
            return res.json(err)
        }
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
        })
        try{
            const savedUser = await newUser.save()
            res.status(200).json(savedUser)
        } catch(e){
            res.status(500).json(e)
        }
    })
})

//LOGIN

router.post('/login', async(req, res)=>{
    User.findOne({username: req.body.username})
    .then(user=>{
        if(!user){
            return res.status(400).json('Incorrect username and password')
        }

        bcrypt.compare(req.body.password, user.password, function (err,result) {
            if (err) { return res.status(500).json(err)}
            if(!result) {
                return res.status(400).json('Incorrect username and password');
            }
            jwt.sign({
                id: user._id,
                isAdmin: user.isAdmin
            }, process.env.JWT_SEC,
            {expiresIn: "1d"}
            , function(err1, token){
                if(err1) return res.status(500).json(err1);
                const { password, ...others } = user._doc;
                res.status(200).json({...others, token});
            })
        })
    })
    .catch(e=>{
        res.status(500).json(e)
    })
})

module.exports = router