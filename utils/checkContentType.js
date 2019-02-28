const errors = require('restify-errors')

module.exports = (req, res, next) => {
  if (!req.is('application/json')) {
    return next(new errors.UnsupportedMediaTypeError("Expects 'application/json'"))
  }
  return next()
}
