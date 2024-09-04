const PhotoModel = require('../models/photo.js');
const AlbumModel = require('../models/album.js');

const Photos = class Photos {
  constructor(app, connect, authenticateToken) {
    this.app = app;
    this.PhotoModel = connect.model('Photo', PhotoModel);
    this.AlbumModel = connect.model('Album', AlbumModel);
    this.authenticateToken = authenticateToken;

    this.run();
  }

  create() {
    this.app.post('/photo/', (req, res) => {
      try {
        const newPhoto = new this.PhotoModel(req.body);

        newPhoto.save().then((photo) => {
          // Add photo to album
          this.AlbumModel.findByIdAndUpdate(photo.album, { 
            $push: { photos: photo._id }
          }).then(() => {
            res.status(200).json(photo || {});
          }).catch(() => {
            res.status(500).json({
              code: 500,
              message: 'Internal Server error while updating album'
            });
          });
        }).catch(() => {
          res.status(500).json({
            code: 500,
            message: 'Internal Server error while saving photo'
          });
        });
      } catch (err) {
        console.error(`[ERROR] photo/create -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  deleteById() {
    this.app.delete('/photo/:id', (req, res) => {
      try {
        this.PhotoModel.findByIdAndDelete(req.params.id).then((photo) => {
          if (photo) {
            // Remove photo from album
            this.AlbumModel.findByIdAndUpdate(photo.album, {
              $pull: { photos: photo._id }
            }).then(() => {
              res.status(200).json(photo || {});
            }).catch(() => {
              res.status(500).json({
                code: 500,
                message: 'Internal Server error while updating album'
              });
            });
          } else {
            res.status(404).json({
              code: 404,
              message: 'Photo not found'
            });
          }
        }).catch(() => {
          res.status(500).json({
            code: 500,
            message: 'Internal Server error while deleting photo'
          });
        });
      } catch (err) {
        console.error(`[ERROR] photo/:id -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  showById() {
    this.app.get('/photo/:id', (req, res) => {
      try {
        this.PhotoModel.findById(req.params.id).then((photo) => {
          res.status(200).json(photo || {});
        }).catch(() => {
          res.status(500).json({
            code: 500,
            message: 'Internal Server error'
          });
        });
      } catch (err) {
        console.error(`[ERROR] photo/:id -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  showAll() {
    this.app.get('/photos', (req, res) => { 
      try {
        this.PhotoModel.find().then((photos) => {
          res.status(200).json(photos ||{});
        }).catch(() => {
          res.status(500).json({
            code: 500,
            message: 'Internal Server error'
          });
        });
      } catch (err) {
        console.error(`[ERROR] /photos -> ${err}`);
  
        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }
  
  updateById() {
    this.app.put('/photo/:id', (req, res) => {
      try {
        this.PhotoModel.findByIdAndUpdate(req.params.id, req.body, { new: true }).then((photo) => {
          if (photo) {
            res.status(200).json(photo);
          } else {
            res.status(404).json({
              code: 404,
              message: 'Photo not found'
            });
          }
        }).catch(() => {
          res.status(500).json({
            code: 500,
            message: 'Internal Server error while updating photo'
          });
        });
      } catch (err) {
        console.error(`[ERROR] photo/:id -> ${err}`);
  
        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  updatePhotoInAlbum() {
    this.app.put('/album/:album_id/photo/:photo_id', (req, res) => {
      try {
        const { album_id, photo_id } = req.params;
        
        this.AlbumModel.findById(album_id).then((album) => {
          if (!album) {
            return res.status(404).json({
              code: 404,
              message: 'Album not found'
            });
          }
  
          if (!album.photos.includes(photo_id)) {
            return res.status(404).json({
              code: 404,
              message: 'Photo not found in this album'
            });
          }
  
          this.PhotoModel.findByIdAndUpdate(photo_id, req.body, { new: true }).then((updatedPhoto) => {
            if (!updatedPhoto) {
              return res.status(404).json({
                code: 404,
                message: 'Photo not found'
              });
            }
            res.status(200).json(updatedPhoto);
          }).catch(() => {
            res.status(500).json({
              code: 500,
              message: 'Internal Server error while updating photo'
            });
          });
        }).catch(() => {
          res.status(500).json({
            code: 500,
            message: 'Internal Server error while retrieving album'
          });
        });
      } catch (err) {
        console.error(`[ERROR] album/:album_id/photo/:photo_id -> ${err}`);
    
        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }
  
  

  run() {
    this.create();
    this.showById();
    this.deleteById();
    this.showAll();
    this.updateById();
    this.updatePhotoInAlbum();
  }
}

module.exports = Photos;