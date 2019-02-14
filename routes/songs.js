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

  // Get one specific song
  server.get('/songs/:id', async (req, res, next) => {
    try {
      let song = await Song.findById(req.params.id)
      res.send(song)
      next()
    } catch (err) {
      next(new errors.ResourceNotFoundError('No song with id: ' + req.params.id))
    }
  })

  // Update one song
  server.put('/songs/:id', async (req, res, next) => {
    if (!req.is('application/json')) {
      return next(new errors.InvalidContentError("Expects 'application/json'"))
    }

    try {
      let song = await Song.findByIdAndUpdate(req.params.id, req.body, { new: true })
      res.send(200, song)
      next()
    } catch (err) {
      next(new errors.ResourceNotFoundError('No song with id: ' + req.params.id))
    }
  })

  // Delete one song
  server.del('/songs/:id', async (req, res, next) => {
    try {
      let song = await Song.findByIdAndRemove(req.params.id)
      res.send(200, song)
    } catch (err) {
      next(new errors.ResourceNotFoundError('No song with id: ' + req.params.id))
    }
  })
}
