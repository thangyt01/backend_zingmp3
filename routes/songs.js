const Song = require('../models/Song')
const User = require('../models/User')
const { verifyTokenAndAdmin, verifyTokenAndAuthoriztion, verifyToken } = require('./verifyToken')
const router = require('express').Router()

//Create
router.post('/', verifyToken, async (req, res)=>{
    const newSong = new Song(req.body)
    const updateUser = await User.findById(req.user.id)
    const playlistUser = updateUser.playlist
    try{
        const savedSong = await newSong.save()
        playlistUser.push((savedSong._id).toString())
        const up = await updateUser.updateOne({"playlist": playlistUser})
        res.status(200).json(savedSong)
    }catch(e){
        res.status(500).json(e)
    }

})

//Update
router.put('/:id', verifyTokenAndAdmin, async(req, res)=>{
    try{
        const updateSong = await Song.findByIdAndUpdate(req.params.id,{
            $set: req.body
        },{
            new: true
        })
        res.status(200).json(updateSong)
    } catch(e){
        res.status(500).json(e)
    }
})

//Update add playlist
router.put('/addPlaylist/:id', verifyTokenAndAuthoriztion, async(req, res)=>{
    try{
        const updateUser = await User.findById(req.user.id)
        const playlistUser = updateUser.playlist
        if(playlistUser.findIndex(i=> i === req.body._id) < 0) {
            playlistUser.push((req.body._id).toString())
            const up = await updateUser.updateOne({"playlist": playlistUser})
            res.status(200).json(up)
        }else{
            res.status(400).json("Bài hát đã tồn tại ở trong playlist")
        }
    } catch(e){
        res.status(500).json(e)
    }
})

//Update remove playlist
router.put('/removePlaylist/:id', verifyTokenAndAuthoriztion, async(req, res)=>{
    try{
        const updateUser = await User.findById(req.user.id)
        const playlistUser = updateUser.playlist
        const pos = playlistUser.findIndex(i=> i === req.body._id)
        if( pos >= 0) {
            const tmp = playlistUser.splice(pos, 1)
            const up = await updateUser.updateOne({"playlist": playlistUser})
            res.status(200).json(up)
        }else{
            res.status(400).json("Bài hát đã tồn tại ở trong playlist")
        }
    } catch(e){
        res.status(500).json(e)
    }
})

//Update view
router.get('/updateview/:id', async(req, res)=>{
    try{
        const updateSong = await Song.findById(req.params.id)
        const viewSong = updateSong.view + 1
        const up = await updateSong.updateOne({"view": viewSong})
        res.status(200).json(updateSong)
    } catch(e){
        res.status(500).json(e)
    }
})

//Delete
router.delete("/:id", verifyTokenAndAdmin, async(req, res)=>{
    try{
        await Song.findByIdAndDelete(req.params.id)
        res.status(200).json('Song has been deleted')
    }catch(e){
        res.status(500).json(e)
    }
})

//Get Song
router.get("/find/:id", async(req, res)=>{
    try{
        const song = await Song.findById(req.params.id)
        res.status(200).json(song)
    }catch(e){
        res.status(500).json(e)
    }
})

//Get Top Song 
router.get("/top/:id", async(req, res)=>{
    const number = req.params.id
    try{
        const song = await Song.find().sort({view: -1}).limit(Number(number))
        res.status(200).json(song)
    }catch(e){
        res.status(500).json(e)
    }
})

//Search Song
// router.get("/search", async(req, res)=>{
//     const qKeyword = (req.query.keyword)
//     try{
//         const songs = await Song.find({ $text: { $search: qKeyword } })
//         res.status(200).json(songs)
//     }catch(e){
//         res.status(500).json(e)
//     }
// })

//Random Song
router.get("/random", async (req, res) => {
    let song
    try {
        song = await Song.aggregate([
            { $sample: { size: 5 } },
          ])
      res.status(200).json(song);
    } catch (err) {
      res.status(500).json(err);
    }
})

//Search Song
router.get("/search", async(req, res)=>{
    const qKeyword = (req.query.keyword)
    try{
        const songs = await Song.aggregate([
            {
              "$search": {
                "index": 'default',
                "text": {
                  "query": qKeyword,
                  "path": {
                    'wildcard': '*'
                  }
                }
              }
            }
          ])
        res.status(200).json(songs)
    }catch(e){
        res.status(500).json(e)
    }
})

//GET ALL Song
router.get("/", async (req, res) => {
    const qNew = req.query.new;
    const qCategory = req.query.category;
    try {
        var songs;
        if(qNew){
            songs = await Song.find().sort({createdAt: -1}).limit(5)
        } else if(qCategory) {
            songs = await Song.find({categories: {
                $in: [qCategory],
            }})
        } else{
            songs = await Song.find()
        }
        res.status(200).json(songs);
    } catch (err) {
        res.status(500).json(err);
    }
});

//GET TOP 100 NEW Song
router.get("/newtop/newsong100", async (req, res) => {
    try {
        const songs = await Song.find().sort({createdAt: -1}).limit(100)
        res.status(200).json(songs);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router