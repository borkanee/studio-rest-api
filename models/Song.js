'use strict'

const mongoose = require('mongoose')
const timestamp = require('mongoose-timestamp')
const paginate = require('mongoose-paginate-v2')

const SongSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  artist: {
    type: String,
    required: true,
    trim: true
  },
  length: {
    type: Number,
    required: true,
    trim: true
  },
  producer: {
    type: String,
    required: true,
    trim: true
  },
  spotifyURL: {
    type: String,
    trim: true,
    default: 'None'
  },
  engineer: {
    type: String,
    trim: true,
    default: 'None'
  }
})

SongSchema.plugin(timestamp)
SongSchema.plugin(paginate)

const Song = mongoose.model('Song', SongSchema)

module.exports = Song
