'use strict'

const errors = require('restify-errors')
const validUrl = require('valid-url')
const Webhook = require('../models/Webhook')
const config = require('../config/config')
const rjwt = require('restify-jwt-community')

module.exports = server => {
  // Webhooks
  server.post('/webhooks', rjwt({ secret: config.JWT_SECRET }), async (req, res, next) => {
    const { payloadURL } = req.body

    if (!validUrl.isUri(payloadURL)) {
      return next(new errors.InvalidContentError('Not a URI'))
    }

    const webhook = new Webhook({
      event: config.WEBHOOK_EVENT,
      payloadURL
    })

    try {
      const newHook = await webhook.save()
      const { event, payloadURL } = newHook

      const resObject = {
        _links: {
          self: {
            href: `${config.URL}/webhooks`
          },
          songs: {
            href: `${config.URL}/songs`,
            method: 'GET'
          }
        },
        event,
        payloadURL
      }

      res.send(201, resObject)
      next()
    } catch (err) {
      return next(new errors.InternalError(err.message))
    }
  })
}
