'use strict'

const express = require('express')
const ash = require('express-async-handler')

const router = express.Router()

const {
  getAllMaintenanceRequests,
  getMaintenanceRequestById,
  createMaintenanceRequest,
  updateMaintenanceRequest,
  deleteMaintenanceRequest
} = require('../controllers/maintenance-requests')

/**
 * Get all requests
 */
router.get('/',
  ash(getAllMaintenanceRequests),
  (req, res) => res.json(req.responseData)
)

/**
 * Get request by id
 */
router.get('/:id',
  ash(getMaintenanceRequestById),
  (req, res) => res.json(req.responseData)
)

/**
 * Create a request
 */
router.post('/',
  ash(createMaintenanceRequest),
  (req, res) => res.json(req.responseData)
)

/**
 * Update a request
 */
router.post('/:id',
  ash(updateMaintenanceRequest),
  (req, res) => res.json(req.responseData)
)

/**
 * Delete a request
 */
router.delete('/:id',
  ash(deleteMaintenanceRequest),
  (req, res) => res.json(req.responseData)
)

module.exports = router
