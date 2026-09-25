const { BrevoClient } = require('@getbrevo/brevo');

let client = null;

const BREVO_API_KEY = process.env.BREVO_API_KEY;

if (BREVO_API_KEY) {
  client = new BrevoClient({ apiKey: BREVO_API_KEY });
  console.log('✅ Brevo email service initialized');
} else {
  console.log('⚠️  Brevo not configured: email features disabled');
}

const isEmailConfigured = () => !!client;

module.exports = { client, isEmailConfigured };
