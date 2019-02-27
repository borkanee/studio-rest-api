module.exports = (song) => {
  let { producer, length, artist, name, spotifyURL, engineer, _id, updatedAt, createdAt } = song

  return {
    _links: {
      self: {
        href: `${process.env.URL}/songs/${song._id}`
      },
      songs: {
        href: `${process.env.URL}/songs`
      },
      update: {
        href: `${process.env.URL}/songs/${song._id}`,
        method: 'PUT'
      },
      delete: {
        href: `${process.env.URL}/songs/${song._id}`,
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
