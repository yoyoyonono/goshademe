async function processDonation({ amount, currency }) {
  if (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0) {
    throw new Error('Invalid donation amount')
  }

  return {
    status: 'approved',
    processor: 'mock',
    currency,
    transactionId: `mock_${Date.now()}`
  }
}

module.exports = { processDonation }
