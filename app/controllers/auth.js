const jwt = require('jsonwebtoken')

const Auth = class Auth {
  /**
   * @constructor
   * @param {Object} app
   */
  constructor (app) {
    this.app = app

    this.run()
  }

  auth () {
    this.app.get('/auth/', (req, res) => {
      try {
        const { name, role } = req.body
        const token = jwt.sign({ name, role }, 'webforce3', { expiresIn: '24h' })

        res.status(200).json({ token })
      } catch (err) {
        console.error(`[ERROR] users/:id -> ${err}`)

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        })
      }
    })
  }

  /**
   * Run
   */
  run () {
    this.auth()
  }
}

module.exports = Auth