'use strict'

const restify = require('restify')
const mongoose = require('mongoose')
const config = require('./config/config.js')

const server = restify.createServer()

server.use(restify.plugins.bodyParser())

server.listen(config.PORT, () => {
  mongoose.connect(config.MONGODB_URI)
})

const db = mongoose.connection

db.on('error', (err) => console.log(err))

db.once('open', () => {
  require('./routes/songs')(server)
  console.log(`Server started on port: ${config.PORT}`)
})
