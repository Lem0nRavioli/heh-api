const mongoose = require('mongoose')

const PhotoSchema = new mongoose.Schema({
  title: String,
  url: String,
  description: String,
  album: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Album'
}}, {
  collection: 'photos',
  versionKey: false
})

module.exports = PhotoSchema