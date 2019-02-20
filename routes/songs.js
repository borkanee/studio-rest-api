'use strict'

const errors = require('restify-errors')
const Song = require('../models/Song')
const config = require('../config/config')

module.exports = server => {
  // Entry point
  server.get('/', (req, res, next) => {
    try {
      // TODO: Return entrypoint using HAL + HATEOAS

      let resObject = {
        _links: {
          self: {
            href: config.URL
          },
          songs: {
            href: `${config.URL}/songs`,
            title: 'Songs'
          },
          ht_register: {
            href: `${config.URL}/users`
          },
          ht_authenticate: {
            href: `${config.URL}/authenticate`
          }
        },
        hint_1: 'You need an account to enter Songs API',
        hint_2: 'Create one by POSTing via the ht_register link..',
        hint_3: 'If you already have an account, login to get a TOKEN by POSTing via the ht_authenticate link'
      }

      res.send(resObject)

      next()
    } catch (err) {
      return next(new errors.InvalidContentError(err))
    }
  })

  // Get all songs
  server.get('/songs', async (req, res, next) => {
    try {
      let songs = await Song.find({})

      let songsResource = songs.map(song => {
        const { engineer, _id, name, artist, length, producer, updatedAt, createdAt } = song

        return {
          _links: {
            self: {
              href: `${config.URL}/songs/${song._id}`
            }
          },
          _id,
          name,
          artist,
          length,
          producer,
          engineer,
          updatedAt,
          createdAt
        }
      })

      let resObject = {
        _links: {
          self: {
            href: `${config.URL}/songs`
          }
        },
        count: songs.length,
        _embedded: {
          songs: songsResource
        }
      }

      res.send(resObject)

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
