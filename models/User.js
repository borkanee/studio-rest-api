'use strict'

const mongoose = require('mongoose')
const errors = require('restify-errors')

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  }
})

UserSchema.pre('save', function (next) {
  let user = this

  User.findOne({ username: user.username }, (err, user) => {
    if (!user) {
      return next()
    } else {
      return next(new errors.ConflictError({ statusCode: 409 }, 'Please choose another username'))
    }
  })
})

const User = mongoose.model('User', UserSchema)

module.exports = User
