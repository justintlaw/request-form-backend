'use strict'

const express = require('express')
const router = express.Router()

const maintenanceRequests = require('./maintenance-requests')

router.use('/requests', maintenanceRequests)

module.exports = router