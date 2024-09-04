const mongoose = require('mongoose')

const AlbumSchema = new mongoose.Schema({
  title: String,
  description: String,
  photos: [
    {type: mongoose.Schema.Types.ObjectId, ref: 'photos'}
  ]
}, {
  collection: 'albums',
  versionKey: false
})

module.exports = AlbumSchema