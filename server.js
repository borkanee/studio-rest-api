'use strict'

const restify = require('restify')
const mongoose = require('mongoose')
const config = require('./config/config.js')
// const rjwt = require('restify-jwt-community')

const server = restify.createServer()

server.use(restify.plugins.bodyParser())

// server.use(rjwt({ secret: config.JWT_SECRET }).unless({ path: ['/users', '/authenticate', '/'] }))

server.listen(config.PORT, () => {
  mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true })
})

const db = mongoose.connection

db.on('error', (err) => console.log(err))

db.once('open', () => {
  require('./routes/songs')(server)
  require('./routes/users')(server)
  require('./routes/webhooks')(server)
  console.log(`Server started on port: ${config.PORT}`)
})
