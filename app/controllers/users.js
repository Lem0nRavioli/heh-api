const UserModel = require('../models/user.js')

const Users = class Users {
  /**
   * @constructor
   * @param {Object} app
   * @param {Object} connect
   */
  constructor (app, connect, authenticateToken) {
    this.app = app
    this.UserModel = connect.model('User', UserModel)
    this.authenticateToken = authenticateToken

    this.run()
  }

  /**
   * Delete by id
   */
    deleteById () {
      this.app.delete('/user/:id', (req, res) => {
        try {
          this.UserModel.findByIdAndDelete(req.params.id).then((user) => {
            res.status(200).json(user || {})
          }).catch(() => {
            res.status(500).json({
              code: 500,
              message: 'Internal Server error'
            })
          })
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
   * Show by id
   */
  showById () {
    this.app.get('/user/:id',  (req, res) => {
      try {
        this.UserModel.findById(req.params.id).then((user) => {
          res.status(200).json(user || {})
        }).catch(() => {
          res.status(500).json({
            code: 500,
            message: 'Internal Server error'
          })
        })
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
   * Create
   */
  create () {
    this.app.post('/user/', (req, res) => {
      try {
        const userModel = new this.UserModel(req.body)

        userModel.save().then((user) => {
          res.status(200).json(user || {})
        }).catch(() => {
          res.status(200).json({})
        })
      } catch (err) {
        console.error(`[ERROR] users/create -> ${err}`)

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
    this.create()
    this.showById()
    this.deleteById()
  }
}

module.exports = Users
