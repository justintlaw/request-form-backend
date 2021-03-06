'use strict'

const dataSources = require('../datasources')
const { Status } = require('../constants')

const createMaintenanceRequest = async (req, _, next) => {
  const { name, address, email, phone, issue } = req.body

  try {
    req.responseData = await dataSources.maintenanceRequests.createMaintenanceRequest({
      name,
      address,
      email,
      phone,
      issue
    })

    return next()
  } catch (err) {
    return next(err)
  }
}

const getAllMaintenanceRequests = async (req, _, next) => {
  const shouldFilterByPending = req.query.pending === 'true'

  try {
    req.responseData = await dataSources.maintenanceRequests.getAllMaintenanceRequests(shouldFilterByPending)
    return next()
  } catch (err) {
    return next(err)
  }
}

const getMaintenanceRequestById = async (req, _, next) => {
  try {
    req.responseData = await dataSources.maintenanceRequests.getMaintenanceRequestById(req.params.id)
    return next()
  } catch (err) {
    return next(err)
  }
}

const updateMaintenanceRequest = async (req, _, next) => {
  const { id } = req.params
  const { name, address, email, phone, issue, status } = req.body


  if (status && !Status[`${status.toUpperCase()}`]) {
    return next(Error('Status must be one of ["pending", "canceled", "completed", ]'))
  }

  try {
    req.responseData = await dataSources.maintenanceRequests.updateMaintenanceRequest(id, {
      name,
      address,
      email,
      phone,
      issue,
      status
    })
  
    return next()
  } catch (err) {
    console.error(err)
    return next(err)
  }
}

const deleteMaintenanceRequest = async (req, _, next) => {
  const { id } = req.params

  try {
    await dataSources.maintenanceRequests.deleteMaintenanceRequest(id)
    return next()
  } catch (err) {
    return next(err)
  }
}

module.exports = {
  createMaintenanceRequest,
  getAllMaintenanceRequests,
  getMaintenanceRequestById,
  updateMaintenanceRequest,
  deleteMaintenanceRequest
}
