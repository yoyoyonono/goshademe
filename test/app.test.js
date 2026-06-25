const test = require('node:test')
const assert = require('node:assert/strict')
const request = require('supertest')
const { createApp } = require('../src/app')

const app = createApp()

test('GET /api/health returns ok', async () => {
  const response = await request(app).get('/api/health')
  assert.equal(response.statusCode, 200)
  assert.deepEqual(response.body, { ok: true })
})

test('GET /api/campaigns returns campaigns list', async () => {
  const response = await request(app).get('/api/campaigns')
  assert.equal(response.statusCode, 200)
  assert.ok(Array.isArray(response.body.campaigns))
  assert.ok(response.body.campaigns.length > 0)
})

test('POST /api/donations rejects invalid amount', async () => {
  const response = await request(app)
    .post('/api/donations')
    .send({ campaignId: 'campaign-1', amount: 0 })

  assert.equal(response.statusCode, 400)
  assert.equal(response.body.error, 'Amount must be a positive number')
})

test('POST /api/donations processes donation', async () => {
  const response = await request(app)
    .post('/api/donations')
    .send({ campaignId: 'campaign-1', amount: 10, donorName: 'Test User' })

  assert.equal(response.statusCode, 201)
  assert.equal(response.body.message, 'Donation processed')
  assert.equal(response.body.payment.processor, 'mock')
})
