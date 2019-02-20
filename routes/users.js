'use strict'

const errors = require('restify-errors')
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const { authenticate } = require('../authenticate')
const jwt = require('jsonwebtoken')
const config = require('../config/config')

module.exports = server => {
  // Register
  server.post('/users', async (req, res, next) => {
    let { username, password } = req.body

    const user = new User({
      username,
      password
    })

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, async (err, hash) => {
        user.password = hash
        res.send(201)
        next()
        try {
          await user.save()
          res.send(201)
          next()
        } catch (err) {
          return next(new errors.InternalError(err.message))
        }
      })
    })
  })

  // Authenticate
  server.post('/authenticate', async (req, res, next) => {
    const { username, password } = req.body

    try {
      const user = await authenticate(username, password)

      const token = jwt.sign(user.toJSON(), config.JWT_SECRET, {
        expiresIn: '1h',
        issuer: 'borkanee'
      })

      res.send(token)
      next()
    } catch (err) {
      return next(new errors.UnauthorizedError(err.message))
    }
  })
}
