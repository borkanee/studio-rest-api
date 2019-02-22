const config = require('./config/config')
const Webhook = require('./models/Webhook')
const fetch = require('node-fetch')
const errors = require('restify-errors')

module.exports.trigger = async (newSong, user) => {
  const hooks = await Webhook.find({})

  for (let i = 0; i < hooks.length; i++) {
    let payload = {
      action: hooks[i].event,
      createdAt: newSong.createdAt,
      sender: user,
      song: {
        name: newSong.name,
        url: `${config.URL}/songs/${newSong._id}`
      }
    }

    try {
      let res = await fetch(hooks[i].payloadURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (res.status !== 200) {
        // Console falsy urls to log...
        console.log(res)
      }
    } catch (err) {
      throw err
    }
  }
}
