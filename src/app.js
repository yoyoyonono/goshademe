const express = require('express')
const path = require('path')
const { getProcessor } = require('./paymentProcessors')

const campaigns = [
  {
    id: 'campaign-1',
    title: 'Community Emergency Fund',
    description: 'Help local families through urgent hardship.',
    goal: 5000,
    raised: 1250
  },
  {
    id: 'campaign-2',
    title: 'School Supplies Drive',
    description: 'Support students with backpacks and materials.',
    goal: 3000,
    raised: 950
  }
]

function createApp() {
  const app = express()

  app.use(express.json())
  app.use(express.static(path.join(__dirname, '..', 'public')))

  app.get('/api/health', (req, res) => {
    res.json({ ok: true })
  })

  app.get('/api/campaigns', (req, res) => {
    res.json({ campaigns })
  })

  app.post('/api/donations', async (req, res) => {
    try {
      const { campaignId, amount, currency = 'USD', donorName = 'Anonymous' } = req.body || {}
      const campaign = campaigns.find((item) => item.id === campaignId)

      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' })
      }

      const numericAmount = Number(amount)
      if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({ error: 'Amount must be a positive number' })
      }

      const processor = getProcessor()
      const paymentResult = await processor.processDonation({
        campaignId,
        amount: numericAmount,
        currency,
        donorName
      })

      campaign.raised += numericAmount

      return res.status(201).json({
        message: 'Donation processed',
        campaign,
        payment: paymentResult
      })
    } catch (error) {
      return res.status(500).json({ error: error.message || 'Unable to process donation' })
    }
  })

  return app
}

module.exports = {
  createApp
}
