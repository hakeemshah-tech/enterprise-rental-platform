const Stripe = require('stripe');

let stripe = null;

if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
  });
  console.log(
    '✅ Stripe initialized (mode:',
    process.env.STRIPE_SECRET_KEY.startsWith('sk_live') ? 'LIVE' : 'TEST',
    ')'
  );
} else {
  console.log('⚠️  Stripe not configured, using simulated payments');
}

const isStripeEnabled = () => !!stripe;

module.exports = { stripe, isStripeEnabled };
