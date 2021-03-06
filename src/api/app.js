'use strict'

const express = require('express')
const cors = require('cors')
const CognitoExpress = require('cognito-express')

// these values are not secret
const cognitoExpress = new CognitoExpress({
  region: 'us-west-2',
  cognitoUserPoolId: 'us-west-2_YYIFjVCCc',
  tokenUse: 'id',
  tokenExpiration: 360000
})

const app = express()
const routes = require('./routes')

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Authorization', 'Accept']
}))

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Response data middleware
app.use((req, res, next) => {
  req.responseData = {}
  next()
})

// Authorization
app.use((req, res, next) => {
  // health check
  if (req.path === '/health') {
    return res.status(200).json({ message: 'healthy' })
  }

  // No authorization needed to create a form or for local use
  if (req.path === '/api/requests' && req.method === 'POST' || process.env.IS_LOCAL === 'true') {
    next()
  } else {
    let accessTokenFromClient = req.headers.authorization

    if (!accessTokenFromClient) {
      return res.status(401).json({ message: 'Not authenticated' })
    }

    // Allow requests from postman
    if (accessTokenFromClient.startsWith('Bearer')) {
      accessTokenFromClient = accessTokenFromClient.split(' ')[1]
    }

    cognitoExpress.validate(accessTokenFromClient, (err, response) => {
      if (err) {
        console.error(err)
        return res.status(401).send({ message: 'Failed to authenticate' })
      }

      req.user = response
      next()
    }).catch(err => {
      console.error(err)
      next()
    })
  }
})

app.use('/api', routes)

// Error middleware
app.use((err, req, res, next) => {
  // TODO: Create custom express errors
  res.status(500).json({ message: err.message })
})

module.exports = app
