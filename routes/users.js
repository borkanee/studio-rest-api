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

        try {
          await user.save()

          const resObject = {
            _links: {
              self: {
                href: `${config.URL}/users`
              },
              login: {
                href: `${config.URL}/authenticate`,
                method: 'POST',
                deescription: 'Authenticate to get a TOKEN that you MUST use when calling the API',
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

      const tokenJWT = jwt.sign({ username: user.username }, config.JWT_SECRET, {
        expiresIn: '1h',
        issuer: 'borkanee'
      })

      res.send({ token: 'Bearer ' + tokenJWT })
      next()
    } catch (err) {
      console.log(err)
      return next(new errors.UnauthorizedError(err.message))
    }
  })
}
