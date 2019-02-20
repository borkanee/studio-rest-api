'use strict'

const restify = require('restify')
const mongoose = require('mongoose')
const config = require('./config/config.js')
const restifyjwt = require('restify-jwt-community')

const server = restify.createServer()

server.use(restify.plugins.bodyParser())

server.use(restifyjwt({ secret: config.JWT_SECRET }).unless({ path: ['/users', '/authenticate'] }))

server.listen(config.PORT, () => {
  mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true })
})

const db = mongoose.connection

db.on('error', (err) => console.log(err))

db.once('open', () => {
  require('./routes/songs')(server)
  require('./routes/users')(server)
  console.log(`Server started on port: ${config.PORT}`)
})
