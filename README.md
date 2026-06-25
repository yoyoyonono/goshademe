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
  "donorName": "Jane",
  "pan": "1234567890123456",
  "otp": "123456"
}
```

## Payment processors

### Mock (default)
No extra setup.

### Shadybank API
Set:

- `PAYMENT_PROCESSOR=shadybank`
- `SHADYBANK_API_URL` (default `http://localhost:8080`)
- Either `SHADYBANK_AUTH_TOKEN` **or** login credentials:
  - `SHADYBANK_ACCOUNT_ID`
  - `SHADYBANK_PASSWORD` or `SHADYBANK_PIN`

For donations through Shadybank, include donor `pan` and either `otp` or `shotp` in request payload.

The integration uses Shadybank merchant endpoints:
- `POST /api/authorize`
- `POST /api/capture`
