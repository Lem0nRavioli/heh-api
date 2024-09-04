const AlbumModel = require('../models/album.js');
const PhotoModel = require('../models/photo.js');

const Albums = class Albums {
  /**
   * @constructor
   * @param {Object} app
   * @param {Object} connect
   */
  constructor(app, connect, authenticateToken) {
    this.app = app;
    this.AlbumModel = connect.model('Album', AlbumModel);
    this.PhotoModel = connect.model('Photo', PhotoModel);
    this.authenticateToken = authenticateToken;

    this.run();
  }

  create() {
    this.app.post('/album/', (req, res) => {
      try {
        const newAlbum = new this.AlbumModel(req.body);

        newAlbum.save().then((album) => {
          res.status(200).json(album || {});
        }).catch(() => {
          res.status(500).json({
            code: 500,
            message: 'Internal Server error while saving album'
          });
        });
      } catch (err) {
        console.error(`[ERROR] create album/ -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  deleteById() {
    this.app.delete('/album/:id', (req, res) => {
      try {
        this.AlbumModel.findByIdAndDelete(req.params.id).then((album) => {
          if (album) {
            // Delete all photos in the album
            this.PhotoModel.deleteMany({ album: album._id }).then(() => {
              res.status(200).json(album || {});
            }).catch(() => {
              res.status(500).json({
                code: 500,
                message: 'Internal Server error while deleting photos'
              });
            });
          } else {
            res.status(404).json({
              code: 404,
              message: 'Album not found'
            });
          }
        }).catch(() => {
          res.status(500).json({
            code: 500,
            message: 'Internal Server error while deleting album'
          });
        });
      } catch (err) {
        console.error(`[ERROR] delete album/:id -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  updateAlbum() {
    this.app.put('/album/:id', (req, res) => {
      try {
        const updateData = req.body;
  
        // Exclude `photos` field from updateData if present
        if (updateData.photos) {
          delete updateData.photos;
        }
        
        this.AlbumModel.findByIdAndUpdate(req.params.id, updateData, { new: true }).then((updatedAlbum) => {
          if (!updatedAlbum) {
            return res.status(404).json({
              code: 404,
              message: 'Album not found'
            });
          }
          res.status(200).json(updatedAlbum);
        }).catch((err) => {
          console.error(`[ERROR] update album/:id -> ${err}`);
          res.status(500).json({
            code: 500,
            message: 'Internal Server Error'
          });
        });
      } catch (err) {
        console.error(`[ERROR] update album/:id -> ${err}`);
        res.status(400).json({
          code: 400,
          message: 'Bad Request'
        });
      }
    });
  }

  showById() {
    this.app.get('/album/:id', (req, res) => {
      try {
        this.AlbumModel.findById(req.params.id).then((album) => {
          res.status(200).json(album || {});
        }).catch(() => {
          res.status(500).json({
            code: 500,
            message: 'Internal Server error'
          });
        });
      } catch (err) {
        console.error(`[ERROR] album/:id -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  showAllAlbums() {
    this.app.get('/albums', (req, res) => {
      try {
        this.AlbumModel.find().then((albums) => {
          res.status(200).json(albums || {});
        }).catch(() => {
          res.status(500).json({
            code: 500,
            message: 'Internal Server error'
          });
        });
      } catch (err) {
        console.error(`[ERROR] albums -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  showAllAlbumPhotos() {
    this.app.get('/:album_id/photos', (req, res) => {
      try {
        this.AlbumModel.findById(req.params.album_id).populate('photos').then((album) => {
          res.status(200).json(album.photos || {});
        }).catch(() => {
          res.status(500).json({
            code: 500,
            message: 'Internal Server error'
          });
        });
      } catch (err) {
        console.error(`[ERROR] /:album_id/photos -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }
  

  run() {
    this.create();
    this.deleteById();
    this.updateAlbum();
    this.showById();
    this.showAllAlbums();
    this.showAllAlbumPhotos();
  }
}

module.exports = Albums;