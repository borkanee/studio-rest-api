
const errors = require('restify-errors')

module.exports = server => {
  server.get('/songs', (req, res, next) => {
    res.send({ msg: 'testing' })
  })
}
