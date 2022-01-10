const router = require("express").Router()
const User = require("../models/User")
const bcrypt = require('bcryptjs')
const { verifyTokenAndAdmin, verifyTokenAndAuthoriztion } = require('./verifyToken')

//Update
router.put('/:id', verifyTokenAndAuthoriztion, async(req, res)=>{
    if(req.body.password){
        bcrypt.hash(req.body.password, 10, async function(err, hashedPassword){
            if (err) {
                return res.json(err)
            }
            req.body.password = hashedPassword
            try{
                const updateUser = await User.findByIdAndUpdate(req.params.id,{
                    $set: req.body
                },{
                    new: true
                })
                res.status(200).json(updateUser)
            } catch(e){
                res.status(500).json(e)
            }
        })
    } else{
        try{
            const updateUser = await User.findByIdAndUpdate(req.params.id,{
                $set: req.body
            },{
                new: true
            })
            res.status(200).json(updateUser)
        } catch(e){
            res.status(500).json(e)
        }
    }
})

//UPDATE VIP
router.put('/updatevip/:id', verifyTokenAndAuthoriztion, async(req, res)=>{
    try{
        const updateUser = await User.findById(req.user.id)
        const codeUser = req.body.code
        const codeServer = (process.env.CODE_VIP).toString()
        if(codeUser === codeServer){
            const up = await updateUser.updateOne({"isVip": true})
            res.status(200).json(up)
        }else{
            res.status(400).json("Code Sai!")
        }
    } catch(e){
        res.status(500).json(e)
    }
})


//Delete
router.delete("/:id",verifyTokenAndAuthoriztion, async(req, res)=>{
    try{
        await User.findByIdAndDelete(req.params.id)
        res.status(200).json('User has been deleted')
    }catch(e){
        res.status(500).json(e)
    }
})


//Get user
router.get("/find/:id",verifyTokenAndAdmin, async(req, res)=>{
    try{
        const user = await User.findById(req.params.id)
        const {password, ...others} = user._doc
        res.status(200).json(others)
    }catch(e){
        res.status(500).json(e)
    }
})

//GET ALL USER
router.get("/", verifyTokenAndAdmin, async (req, res) => {
    const query = req.query.new;
    try {
      const users = query
        ? await User.find().sort({ _id: -1 }).limit(5)
        : await User.find();
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json(err);
    }
});

router.get("/stats", verifyTokenAndAdmin, async (req, res) => {
    const date = new Date();
    const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));
  
    try {
        const data = await User.aggregate([
            { $match: { createdAt: { $gte: lastYear } } },
            {
                $project: {
                month: { $month: "$createdAt" },
                },
            },
            {
                $group: {
                _id: "$month",
                total: { $sum: 1 },
                },
            },
        ]);
        res.status(200).json(data)
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router