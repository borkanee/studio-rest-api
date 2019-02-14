const mongoose = require('mongoose')
const timestamp = require('mongoose-timestamp')

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
  spotifyURL: {
    type: String,
    trim: true,
    defualt: 'None'
  },
  producer: {
    type: String,
    required: true,
    trim: true
  },
  engineer: {
    type: String,
    trim: true,
    default: 'None'
  }
})

SongSchema.plugin(timestamp)

const Song = mongoose.model('Song', SongSchema)

module.export = Song
