const config = require('./config/config')

module.exports = (song) => {
  let { producer, length, artist, name, spotifyURL, engineer, _id, updatedAt, createdAt } = song

  return {
    _links: {
      self: {
        href: `${config.URL}/songs/${song._id}`
      },
      songs: {
        href: `${config.URL}/songs`
      },
      update: {
        href: `${config.URL}/songs/${song._id}`,
        method: 'PUT'
      },
      delete: {
        href: `${config.URL}/songs/${song._id}`,
        method: 'DELETE'
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
}
