const test = require('node:test')
const assert = require('node:assert/strict')
const { processDonation } = require('../src/paymentProcessors/shadybankProcessor')

function createResponse(status, bodyText = '') {
  return {
    ok: status >= 200 && status < 300,
    status,
    async text() {
      return bodyText
    }
  }
}

test('shadybank processor requires pan', async () => {
  process.env.SHADYBANK_AUTH_TOKEN = 'test-token'
  await assert.rejects(
    () => processDonation({ amount: 10, otp: '123456' }),
    /requires donor card PAN/
  )
})

test('shadybank processor authorizes and captures', async () => {
  process.env.SHADYBANK_AUTH_TOKEN = 'test-token'
  process.env.SHADYBANK_API_URL = 'http://fake-shadybank'

  const calls = []
  const oldFetch = global.fetch

  global.fetch = async (url, options) => {
    calls.push({ url, options })
    if (url === 'http://fake-shadybank/api/authorize') {
      return createResponse(200, '654321')
    }
    if (url === 'http://fake-shadybank/api/capture') {
      return createResponse(204, '')
    }
    return createResponse(500, 'unexpected call')
  }

  try {
    const result = await processDonation({
      campaignId: 'campaign-1',
      donorName: 'Test User',
      amount: 25,
      currency: 'USD',
      pan: '1234567890123456',
      otp: '123456'
    })

    assert.equal(result.processor, 'shadybank')
    assert.equal(result.authCode, '654321')
    assert.equal(calls.length, 2)
    assert.equal(calls[0].url, 'http://fake-shadybank/api/authorize')
    assert.equal(calls[1].url, 'http://fake-shadybank/api/capture')
  } finally {
    global.fetch = oldFetch
    delete process.env.SHADYBANK_API_URL
  }
})
