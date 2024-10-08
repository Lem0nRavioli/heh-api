// Dependencies
const express = require('express')
const mongoose = require('mongoose')

// https thingies
const https = require('https');
const fs = require('fs');

const jwt = require('jsonwebtoken')
const rateLimit = require('express-rate-limit')

// Dependencies middleware
const bodyParser = require('body-parser')
const compression = require('compression')
const cors = require('cors')
const helmet = require('helmet')

// Core
const config = require('./config.js')
const routes = require('./controllers/routes.js')

/**
 * Server
 */
module.exports = class Server {
  constructor () {
    this.app = express()
    this.config = config[process.argv[2]] || config.development
  }

  /*
   * db connect
   * @return {Object} connect
   */
  dbConnect () {
    const host = this.config.mongodb
    const connect = mongoose.createConnection(host)

    connect.on('error', (err) => {
      setTimeout(() => {
        console.log('[ERROR] users api dbConnect() -> mongodb error')
        this.connect = this.dbConnect(host)
      }, 5000)

      console.error(`[ERROR] users api dbConnect() -> ${err}`)
    })

    connect.on('disconnected', (err) => {
      setTimeout(() => {
        console.log('[DISCONNECTED] users api dbConnect() -> mongodb disconnected')
        this.connect = this.dbConnect(host)
      }, 5000)
    })

    process.on('SIGINT', () => {
      connect.close(() => {
        console.log('[API END PROCESS] users api dbConnect() -> close mongodb connection')
        process.exit(0)
      })
    })

    return connect
  }

  /**
   * Middleware
   */
  middleware () {

    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 30,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
    })

    // Apply rate-limiter to all requests
    this.app.use(limiter)

    this.app.use(compression())
    this.app.use(cors())
    this.app.use(bodyParser.urlencoded({ 'extended': true }))
    this.app.use(bodyParser.json())
  }

  /**
   * Routes
   */
  routes () {
    new routes.Users(this.app, this.connect, this.authenticateToken)
    new routes.Auth(this.app)
    new routes.Albums(this.app, this.connect, this.authenticateToken)
    new routes.Photos(this.app, this.connect, this.authenticateToken)

    // If route not exist
    this.app.use((req, res) => {
      res.status(404).json({
        'code': 404,
        'message': 'Not Found'
      })
    })
  }

  /**
   * Security
   */
  security () {
    this.app.use(helmet())
    this.app.disable('x-powered-by')
  }

  authenticateToken(req, res, next) {
    const token = req.headers['authorization']

    if (!token) return res.sendStatus(403)

    jwt.verify(token, 'webforce3', (err, user) => {
      if (err) return res.sendStatus(401)

      req.user = user

      next()
    })
  }

  /**
   * Run
   */
  run () {
    try {
      this.connect = this.dbConnect()
      this.security()
      this.middleware()
      this.routes()
      // this.app.listen(this.config.port)
      // Load SSL certificate and key
      const sslOptions = {
        key: fs.readFileSync(__dirname + '/ssl/server.key'),
        cert: fs.readFileSync(__dirname + '/ssl/server.cert'),
      };

      // Create HTTPS server
      https.createServer(sslOptions, this.app).listen(this.config.port_https, () => {
        console.log(`HTTPS Server running on port ${this.config.port_https}`);
      });
    } catch (err) {
      console.error(`[ERROR] Server -> ${err}`)
    }
  }
}
