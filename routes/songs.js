'use strict'

const errors = require('restify-errors')
const Song = require('../models/Song')
const config = require('../config/config')
const createSongResource = require('../createSongResource')

module.exports = server => {
  // Entry point
  server.get('/', (req, res, next) => {
    try {
      let resObject = {
        _links: {
          self: {
            href: config.URL
          },
          songs: {
            href: `${config.URL}/songs`,
            title: 'Collection of songs in the system'

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
        const { engineer, _id, spotifyURL, name, artist, length, producer, updatedAt, createdAt } = song

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
          spotifyURL,
          engineer,
          updatedAt,
          createdAt
        }
      })

      let resObject = {
        _links: {
          self: {
            href: `${config.URL}/songs`
          },
          create: {
            href: `${config.URL}/songs`,
            method: 'POST',
            requestEncoding: 'application/json',
            data: {
              name: {
                type: 'string',
                required: true
              },
              artist: {
                type: 'string',
                required: true
              },
              length: {
                type: 'number',
                required: true,
                description: 'Lenght in seconds'
              },
              producer: {
                type: 'string',
                required: true
              },
              spotifyURL: {
                type: 'string',
                optional: true
              },
              engineer: {
                type: 'string',
                optional: true
              }
            },
            count: songs.length,
            _embedded: {
              songs: songsResource
            }
          }
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

    let { name, artist, length, producer, spotifyURL, engineer } = req.body

    let song = new Song({
      name,
      artist,
      length,
      producer,
      spotifyURL,
      engineer
    })

    try {
      let newSong = await song.save()

      let songResource = createSongResource(newSong)

      res.send(201, songResource)
      next()
    } catch (err) {
      return next(new errors.InternalError(err.message))
    }
  })

  // Get one specific song
  server.get('/songs/:id', async (req, res, next) => {
    try {
      const song = await Song.findById(req.params.id, '-__v')
      const songResource = createSongResource(song)

      res.send(songResource)
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
