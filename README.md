# goshademe

Basic GoFundMe-style MVP with a pluggable payment backend.

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:3000`.

## Available API

- `GET /api/health`
- `GET /api/campaigns`
- `POST /api/donations`

### Donation payload

```json
{
  "campaignId": "campaign-1",
  "amount": 25,
  "currency": "USD",
  "donorName": "Jane"
}
```

## Plug in a payment processor

Set `PAYMENT_PROCESSOR` to a registered processor name. By default, the app uses the built-in `mock` processor.

To register your own processor at startup, use `registerProcessor(name, processor)` from `/src/paymentProcessors/index.js`.
