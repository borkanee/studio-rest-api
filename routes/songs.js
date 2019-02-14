'use strict'

const errors = require('restify-errors')
const Song = require('../models/Song')

module.exports = server => {
  // Get all songs
  server.get('/songs', async (req, res, next) => {
    try {
      let songs = await Song.find({})
      res.send(songs)

      next()
    } catch (err) {
      return next(new errors.InvalidContentError(err))
    }
  })

  // Add one song
  server.post('/songs', async (req, res, next) => {
    if (!req.is('application/json')) {
      return next(new errors.InvalidContentError("Expects 'application/json'"))
    }

    let { name, artist, length, producer } = req.body

    let customer = new Song({
      name,
      artist,
      length,
      producer
    })

    try {
      let newSong = await customer.save()
      res.send(201, newSong)
      next()
    } catch (err) {
      return next(new errors.InternalError(err.message))
    }
  })
}
