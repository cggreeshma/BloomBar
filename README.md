# BloomBar

Premium flower boutique and custom bouquet studio. React + Express + MongoDB.

## Run locally

1. Install [MongoDB](https://www.mongodb.com/try/download/community) and start it on `mongodb://127.0.0.1:27017`.
2. From the project root:

```bash
npm install
npm run install:all
npm run seed
npm run dev
```

- Storefront: http://localhost:5173
- API: http://localhost:5000

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Customer | demo@bloombar.com | Demo@123 |
| Admin | admin@bloombar.com | Admin@123 |

Coupons: `BLOOM10`, `WELCOME250`, `PETAL15`.

Payments work in demo mode without Razorpay keys (UPI / card / netbanking complete instantly). Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `backend/.env` for test-mode checkout. SMTP is optional; password-reset links print a dev token when email is not configured.
