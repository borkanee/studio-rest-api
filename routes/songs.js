'use strict'

const errors = require('restify-errors')
const Song = require('../models/Song')
const rjwt = require('restify-jwt-community')
const createSongResource = require('../utils/createSongResource')
const webhooks = require('../utils/webhooks')
const checkContentType = require('../utils/checkContentType')

module.exports = server => {
  // ENTRY POINT API!
  server.get('/', (req, res, next) => {
    try {
      let resObject = {
        _links: {
          self: {
            href: process.env.URL
          },
          songs: {
            href: `${process.env.URL}/songs`,
            description: 'Collection of songs in the system'

          },
          register: {
            href: `${process.env.URL}/users`,
            method: 'POST',
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
          },
          authenticate: {
            href: `${process.env.URL}/authenticate`,
            method: 'POST',
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
          },
          webhooks: {
            href: `${process.env.URL}/webhooks`,
            method: 'POST',
            parameters: {
              payloadURL: {
                type: 'string',
                required: true
              }
            }
          }
        },
        hint_1: 'You need an account to create, update and delete resources',
        hint_2: 'Create an account by POSTing via the register link.',
        hint_3: 'If you already have an account, login to get a TOKEN by POSTing via the authenticate link',
        hint_4: 'If you want to register webhooks, create by POSTing via the webhooks link'
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
      let pagination = await Song.paginate({}, {
        page: req.query.page ? parseInt(req.query.page) : 1,
        limit: 10,
        select: '_id name',
        collation: {
          locale: 'en'
        }
      })

      let songsResource = pagination.docs.map(song => {
        const { _id, name } = song

        return {
          _links: {
            self: {
              href: `${process.env.URL}/songs/${_id}`
            }
          },
          _id,
          name
        }
      })

      let resObject = {
        _links: {
          self: {
            href: req.query.page ? `${process.env.URL}/songs?page=${pagination.page}` : `${process.env.URL}/songs`
          },
          first: {
            href: `${process.env.URL}/songs`
          },
          prev: pagination.hasPrevPage ? {
            href: `${process.env.URL}/songs?page=${pagination.prevPage}`
          } : {},
          next: pagination.hasNextPage ? {
            href: `${process.env.URL}/songs?page=${pagination.nextPage}`
          } : {},
          last: {
            href: `${process.env.URL}/songs?page=${pagination.totalPages}`
          },
          create: {
            href: `${process.env.URL}/songs`,
            method: 'POST',
            description: 'Add a song by POSTing with the data specified below.',
            parameters: {
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
            }
          }
        },
        count: pagination.docs.length,
        total: pagination.totalDocs,
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
  server.post('/songs', checkContentType, rjwt({ secret: process.env.JWT_SECRET }), async (req, res, next) => {
    let { name, artist, length, producer, spotifyURL, engineer } = req.body

    let newSong = new Song({
      name,
      artist,
      length,
      producer,
      spotifyURL,
      engineer
    })

    try {
      await newSong.save()
      const songResource = createSongResource(newSong)

      res.send(201, songResource)

      webhooks.trigger(newSong, req.user.username)

      next()
    } catch (err) {
      return err.name === 'ValidationError'
        ? next(new errors.UnprocessableEntityError(err.message))
        : next(new errors.InternalError(err.message))
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
  server.put('/songs/:id', checkContentType, rjwt({ secret: process.env.JWT_SECRET }), async (req, res, next) => {
    try {
      const song = await Song.findByIdAndUpdate(req.params.id, req.body, { new: true })
      const songResource = createSongResource(song)

      res.send(200, songResource)
      next()
    } catch (err) {
      next(new errors.ResourceNotFoundError('No song with id: ' + req.params.id))
    }
  })

  // Delete one song
  server.del('/songs/:id', rjwt({ secret: process.env.JWT_SECRET }), async (req, res, next) => {
    try {
      const song = await Song.findByIdAndRemove(req.params.id)

      const resObject = {
        _links: {
          songs: {
            href: `${process.env.URL}/songs`
          }
        },
        id: song._id,
        name: song.name
      }

      res.send(200, resObject)
    } catch (err) {
      next(new errors.ResourceNotFoundError('No song with id: ' + req.params.id))
    }
  })
}
