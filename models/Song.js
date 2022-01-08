const mongoose = require('mongoose')

const SongSchema = new mongoose.Schema({
    name: {type: String, required: true},
    img: {type: String},
    singer: {type: String, required: true},
    album: {type: String},
    mp3: {type: String, required: true},
    gener: {type: String},
    view:{type: Number, default: 0}
},{
    timestamps: true
})

module.exports = mongoose.model("Song", SongSchema)