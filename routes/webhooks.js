'use strict'

const errors = require('restify-errors')
const validUrl = require('valid-url')
const Webhook = require('../models/Webhook')
const config = require('../config/config')

module.exports = server => {
  // Webhooks
  server.post('/webhooks', async (req, res, next) => {
    const { url } = req.body

    if (!validUrl.isUri(url)) {
      return next(new errors.InvalidContentError('Not a URI'))
    }

    const webhook = new Webhook({
      event: config.WEBHOOK_EVENT,
      payloadURL: url
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
