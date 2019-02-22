'use strict'

const mongoose = require('mongoose')

const WebhookSchema = new mongoose.Schema({
  event: {
    type: String,
    required: true,
    trim: true
  },
  payloadURL: {
    type: String,
    required: true,
    trim: true
  }
})

const Webhook = mongoose.model('Webhook', WebhookSchema)

module.exports = Webhook
