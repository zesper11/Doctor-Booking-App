# Prescripto Doctor Booking

Prescripto is a React/Vite doctor directory with guest appointment booking, Stripe Checkout, and a booking history for the current browser.

## Run locally

1. Run MongoDB locally or create a MongoDB Atlas database. Create a Stripe account and use a **test-mode** secret key (`sk_test_...`). Do not use a live key for local testing.
2. In PowerShell, configure the API:

	```powershell
	cd Backend
	npm install
	Copy-Item .env.example .env
	```

	Set `MONGODB_URI` in `Backend/.env` to your MongoDB connection URI and put your Stripe test secret key in `STRIPE_SECRET_KEY`. Keep `.env` private; it is ignored by Git.
3. Start the API in that terminal:

	```powershell
	npm run dev
	```

4. In a second terminal, start the frontend:

	```powershell
	cd Frontend
	npm install
	npm run dev
	```

	Open the URL printed by Vite. The development server proxies `/api` requests to `http://localhost:4242`.

## Accounts and contact

Signup and login use email/password accounts stored in MongoDB. Passwords are bcrypt-hashed and sessions are held in HttpOnly cookies. The supplied Gmail address is used as the contact address; Google OAuth and outbound Gmail sending are not configured.

## Deploy to Vercel

Import the repository into Vercel with the repository root as the project root. The root `vercel.json` builds the Vite app, serves client-side routes through `index.html`, and routes `/api/*` to the Mongo-backed serverless function. Node.js 22.12 or newer is required.

Add these environment variables in Vercel Project Settings for Production (and Preview if needed):

| Variable | Value |
| --- | --- |
| `MONGODB_URI` | Your MongoDB Atlas connection URI |
| `MONGODB_DB_NAME` | `prescripto` or your chosen database name |
| `STRIPE_SECRET_KEY` | Stripe secret key; use `sk_test_...` while testing |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret for the deployed `/api/webhooks/stripe` endpoint |
| `CLIENT_URL` | The deployed site origin, for example `https://your-project.vercel.app` |

The frontend calls the same-origin `/api` routes, so no `VITE_API_BASE_URL` is required. Configure the Stripe webhook URL in Stripe and restrict MongoDB Atlas network access according to your deployment policy.

After adding the variables, deploy from the Vercel dashboard or run `vercel` from the repository root with the Vercel CLI installed and authenticated.

## Test a payment

Book an appointment and use Stripe's test card `4242 4242 4242 4242`, any future expiry date, any CVC, and any postal code. Stripe test mode does not charge a real card. After returning to Prescripto, the server retrieves the Checkout Session from Stripe and confirms the booking only when Stripe reports it as paid.

For webhook testing, install the Stripe CLI, then run:

```powershell
stripe listen --forward-to localhost:4242/api/webhooks/stripe
```

Copy the `whsec_...` value printed by the CLI into `STRIPE_WEBHOOK_SECRET` in `Backend/.env`, then restart the API. The return-page verification also confirms a successful test payment without the CLI.

## Checks

```powershell
cd Backend
npm test

cd ..\Frontend
npm run build
npm run lint
```

## Storage notes

The API stores users, sessions, and bookings in MongoDB. A unique partial index prevents two active bookings for the same doctor/date/time. Guest booking access tokens remain in browser local storage; signed-in appointment history is associated with the account. Do not store regulated health information without the required compliance, privacy, and security controls.
