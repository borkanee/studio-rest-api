'use strict'

const restify = require('restify')
const mongoose = require('mongoose')
const errors = require('restify-errors')

if (process.env.NODE_ENV === 'development') {
  require('dotenv').config()
}

const server = restify.createServer()

server.use(restify.plugins.jsonBodyParser())
server.use(restify.plugins.acceptParser('application/json'))
server.use(restify.plugins.queryParser())
server.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https') {
    if (req.method === 'GET') {
      return res.redirect('https://' + req.headers.host + req.url, next)
    } else {
      return next(new errors.ForbiddenError('Only HTTPS connections are allowed'))
    }
  } else {
    return next()
  }
})

server.listen(process.env.PORT, () => {
  mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true })
})

const db = mongoose.connection

db.on('error', (err) => console.log(err))

db.once('open', () => {
  require('./routes/songs')(server)
  require('./routes/users')(server)
  require('./routes/webhooks')(server)
  console.log(`Server started on port: ${process.env.PORT}`)
})
