const AlbumModel = require('../models/album.js')

const Albums = class Albums {
  /**
   * @constructor
   * @param {Object} app
   * @param {Object} connect
   */
  constructor (app, connect, authenticateToken) {
    this.app = app
    this.AlbumModel = connect.model('Album', AlbumModel)
    this.authenticateToken = authenticateToken

    this.run()
  }

  /**
   * Delete by id
   */
    deleteById () {
      this.app.delete('/album/:id', (req, res) => {
        try {
          this.AlbumModel.findByIdAndDelete(req.params.id).then((album) => {
            res.status(200).json(album || {})
          }).catch(() => {
            res.status(500).json({
              code: 500,
              message: 'Internal Server error'
            })
          })
        } catch (err) {
          console.error(`[ERROR] album/:id -> ${err}`)
  
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
    this.app.get('/album/:id',  (req, res) => {
      try {
        this.AlbumModel.findById(req.params.id).then((album) => {
          res.status(200).json(album || {})
        }).catch(() => {
          res.status(500).json({
            code: 500,
            message: 'Internal Server error'
          })
        })
      } catch (err) {
        console.error(`[ERROR] album/:id -> ${err}`)

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
    this.app.post('/album/', (req, res) => {
      try {
        const AlbumModel = new this.AlbumModel(req.body)

        AlbumModel.save().then((album) => {
          res.status(200).json(album || {})
        }).catch(() => {
          res.status(200).json({})
        })
      } catch (err) {
        console.error(`[ERROR] album/create -> ${err}`)

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

module.exports = Albums
