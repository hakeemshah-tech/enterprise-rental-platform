const router = require('express').Router();
const express = require('express');
const { handleStripeWebhook } = require('../controllers/webhook.controller');

// Stripe requires raw body for signature verification
router.post('/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);

module.exports = router;
