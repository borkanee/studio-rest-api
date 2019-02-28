'use strict'

const User = require('../models/User')
const bcrypt = require('bcryptjs')

module.exports = async (username, password) => {
  try {
    const user = await User.findOne({ username })

    const isMatch = await bcrypt.compare(password, user.password)

    if (isMatch) {
      return user
    } else {
      throw new Error('Failed to authenticate')
    }
  } catch (err) {
    throw new Error('Failed to authenticate')
  }
}
