'use strict'

const errors = require('restify-errors')
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const authenticate = require('../utils/authenticate')
const checkContentType = require('../utils/checkContentType')
const jwt = require('jsonwebtoken')

module.exports = server => {
  // Register
  server.post('/users', checkContentType, async (req, res, next) => {
    let { username, password } = req.body

    if (username.length < 4 || password.length < 6) {
      return next(new errors.UnprocessableEntityError('Username: 4 characters or more, Password: 6 characters or more'))
    }

    const user = new User({
      username,
      passwords
    })

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, async (err, hash) => {
        user.password = hash

        try {
          await user.save()

          const resObject = {
            _links: {
              self: {
                href: `${process.env.URL}/users`
              },
              login: {
                href: `${process.env.URL}/authenticate`,
                method: 'POST',
                description: 'Authenticate to get a TOKEN that you MUST use when calling the API',
                parameters: {
                  username: {
                    type: 'string',
                    required: true
                  },
                  password: {
                    type: 'string',
                    required: true
                  }
                }
              }
            }
          }

          res.send(201, resObject)
          next()
        } catch (err) {
          if (err.statusCode === 409) return res.send(200, { message: err.message })
          if (err.name === 'ValidationError') return next(new errors.UnprocessableEntityError(err.message))
          return next(new errors.InternalError(err.message))
        }
      })
    })
  })

  // Authenticate
  server.post('/authenticate', checkContentType, async (req, res, next) => {
    const { username, password } = req.body

    try {
      const user = await authenticate(username, password)

      const tokenJWT = jwt.sign({ username: user.username }, process.env.JWT_SECRET, {
        expiresIn: '2h',
        issuer: 'borkanee'
      })

      res.send({ token: 'Bearer ' + tokenJWT })
      next()
    } catch (err) {
      return next(new errors.UnauthorizedError(err.message))
    }
  })
}
