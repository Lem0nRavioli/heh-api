const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  name: String,
  role: String,
  avatar: String
}, {
  collection: 'users',
  // minimize: false,
  versionKey: false
})
// .set('toJSON', {
//   transform: (doc, ret) => {
//     ret.id = ret._id

//     delete ret._id
//   }
// })

module.exports = UserSchema