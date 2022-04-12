'use strict'

const { v4: uuidv4 } = require('uuid')
const { DynamoDB } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient, GetCommand, ScanCommand, QueryCommand, PutCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb')
const { TABLE_NAME: TableName = 'maintenance_requests' } = process.env

const options = process.env.IS_LOCAL ? { endpoint: 'http://localhost:8000' } : {}
const client = new DynamoDB(options)
const ddbClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true
  }
})

const { Status } = require('../constants')
const ValidStatuses = [Status.CANCELED, Status.PENDING, Status.COMPLETED]

const createMaintenanceRequest = async ({ name, address, email, phone, issue }) => {
  const res = await ddbClient.send(new PutCommand({
    TableName,
    Item: {
      id: uuidv4(),
      name,
      address,
      email,
      phone,
      issue,
      status: Status.PENDING,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }))

  console.log('res', res)

  return {}
}

const getAllMaintenanceRequests = async (shouldFilterByPending = false) => {
  if (shouldFilterByPending) {
    const { Items } = await ddbClient.send(new QueryCommand({
      TableName,
      IndexName: 'StatusIndex',
      KeyConditionExpression: '#s=:pending_status',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: { ':pending_status': 'pending' }
    }))

    return Items
  }

  const { Items } = await ddbClient.send(new ScanCommand({
    TableName,
    ProjectionExpression: 'id, #n, address, email, phone, issue, #s, created_at, updated_at',
    ExpressionAttributeNames: { '#n': 'name', '#s': 'status' }
  }))

  return Items
}

const getMaintenanceRequestById = async (id) => {
  const { Item } = await ddbClient.send(new GetCommand({
    TableName,
    Key: {
      id
    }
  }))

  return Item
}

const updateMaintenanceRequest = async (id, { name, address, email, phone, issue, status }) => {
  let updateExpression = 'SET '
  let expressionAttributeValues = {}
  let expressionAttributeNames = {}

  console.log('status', status)

  if (name) {
    updateExpression += ',#n=:n'
    expressionAttributeValues[':n'] = name
    expressionAttributeNames['#n'] = 'name'
  }

  if (address) {
    updateExpression += ',address=:address'
    expressionAttributeValues[':address'] = address
  }

  if (email) {
    updateExpression += ',email=:email'
    expressionAttributeValues[':email'] = email
  }

  if (phone) {
    updateExpression += ',phone=:phone'
    expressionAttributeValues[':phone'] = phone
  }

  if (issue) {
    updateExpression += ',issue=:issue'
    expressionAttributeValues[':issue'] = issue
  }

  if (status) {
    if (!ValidStatuses.includes(status)) {
      throw new Error('Invalid Status')
    }

    updateExpression += ',#s=:s'
    expressionAttributeValues[':s'] = status
    expressionAttributeNames['#s'] = 'status'
  }

  updateExpression += ',updated_at=:updated_at'
  expressionAttributeValues[':updated_at'] = new Date().toISOString()

  // remove first comma
  updateExpression = updateExpression.slice(0, 4) + updateExpression.slice(5)

  // Only pass ExpressionAttributeNames if it is populated
  let optionalParams = {}
  if (Object.keys(expressionAttributeNames).length > 0) {
    console.log('im in')
    optionalParams.ExpressionAttributeNames = expressionAttributeNames
  }

  console.log('hi')

  const { Attributes } = await ddbClient.send(new UpdateCommand({
    ...optionalParams,
    TableName,
    Key: { id },
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW'
  }))

  return Attributes
}

const deleteMaintenanceRequest = async (id) => {
  await ddbClient.send(new DeleteCommand({
    TableName,
    Key: { id }
  }))

  return {}
}

module.exports = {
  createMaintenanceRequest,
  getAllMaintenanceRequests,
  getMaintenanceRequestById,
  updateMaintenanceRequest,
  deleteMaintenanceRequest
}
