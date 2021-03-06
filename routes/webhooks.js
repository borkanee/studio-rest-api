'use strict'

const errors = require('restify-errors')
const validUrl = require('valid-url')
const Webhook = require('../models/Webhook')
const rjwt = require('restify-jwt-community')
const checkContentType = require('../utils/checkContentType')

module.exports = server => {
  // Webhooks
  server.post('/webhooks', checkContentType, rjwt({ secret: process.env.JWT_SECRET }), async (req, res, next) => {
    const { payloadURL } = req.body

    if (!validUrl.isUri(payloadURL)) {
      return next(new errors.InvalidContentError('Not a URI'))
    }

    const webhook = new Webhook({
      event: process.env.WEBHOOK_EVENT,
      payloadURL
    })

    try {
      const newHook = await webhook.save()
      const { event, payloadURL } = newHook

      const resObject = {
        _links: {
          self: {
            href: `${process.env.URL}/webhooks`
          },
          songs: {
            href: `${process.env.URL}/songs`,
            method: 'GET'
          }
        },
        event,
        payloadURL
      }

      res.send(201, resObject)
      next()
    } catch (err) {
      return err.name === 'ValidationError'
        ? next(new errors.UnprocessableEntityError(err.message))
        : next(new errors.InternalError(err.message))
    }
  })
}
