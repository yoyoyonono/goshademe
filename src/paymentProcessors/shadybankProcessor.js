function asFormBody(payload) {
  const form = new URLSearchParams()
  for (const [key, value] of Object.entries(payload)) {
    if (value !== undefined && value !== null && value !== '') {
      form.append(key, String(value))
    }
  }
  return form
}

async function loginForToken(baseUrl) {
  const accountId = process.env.SHADYBANK_ACCOUNT_ID
  const password = process.env.SHADYBANK_PASSWORD
  const pin = process.env.SHADYBANK_PIN

  if (!accountId || (!password && !pin)) {
    throw new Error('Missing Shadybank credentials: set SHADYBANK_AUTH_TOKEN or SHADYBANK_ACCOUNT_ID plus SHADYBANK_PASSWORD/SHADYBANK_PIN')
  }

  const loginBody = asFormBody({
    account_id: accountId,
    password,
    pin
  })

  const response = await fetch(`${baseUrl}/api/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: loginBody
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Shadybank login failed (${response.status}): ${text || 'no details'}`)
  }

  return (await response.text()).trim()
}

async function getAuthToken(baseUrl) {
  if (process.env.SHADYBANK_AUTH_TOKEN) {
    return process.env.SHADYBANK_AUTH_TOKEN
  }
  return loginForToken(baseUrl)
}

async function processDonation({ amount, currency = 'USD', donorName = 'Anonymous', pan, otp, shotp, campaignId }) {
  const numericAmount = Number(amount)
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new Error('Invalid donation amount')
  }

  if (!pan) {
    throw new Error('Shadybank donation requires donor card PAN')
  }

  if (!otp && !shotp) {
    throw new Error('Shadybank donation requires otp or shotp')
  }

  if (currency !== 'USD') {
    throw new Error('Shadybank processor currently supports USD only')
  }

  const baseUrl = (process.env.SHADYBANK_API_URL || 'http://localhost:8080').replace(/\/$/, '')
  const authToken = await getAuthToken(baseUrl)
  const authorization = 'Bearer ' + authToken

  const authorizeBody = asFormBody({
    amount: numericAmount.toFixed(2),
    pan,
    otp,
    shotp
  })

  const authorizeResponse = await fetch(`${baseUrl}/api/authorize`, {
    method: 'POST',
    headers: {
      Authorization: authorization,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: authorizeBody
  })

  if (!authorizeResponse.ok) {
    const text = await authorizeResponse.text()
    throw new Error(`Shadybank authorize failed (${authorizeResponse.status}): ${text || 'no details'}`)
  }

  const authCode = (await authorizeResponse.text()).trim()
  if (!authCode) {
    throw new Error('Shadybank authorize did not return auth code')
  }

  const captureBody = asFormBody({
    amount: numericAmount.toFixed(2),
    auth_code: authCode,
    description: `Donation for ${campaignId} by ${donorName}`
  })

  const captureResponse = await fetch(`${baseUrl}/api/capture`, {
    method: 'POST',
    headers: {
      Authorization: authorization,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: captureBody
  })

  if (!captureResponse.ok) {
    const text = await captureResponse.text()
    throw new Error(`Shadybank capture failed (${captureResponse.status}): ${text || 'no details'}`)
  }

  return {
    status: 'approved',
    processor: 'shadybank',
    currency,
    authCode,
    transactionId: `shadybank_${authCode}`
  }
}

module.exports = { processDonation }
