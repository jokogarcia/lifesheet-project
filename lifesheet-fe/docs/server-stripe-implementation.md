# Server-Side Stripe Integration

This document outlines how to implement the Stripe checkout backend endpoints for the LifeSheet application.

## Prerequisites

1. Install Stripe package:
```bash
npm install stripe
```

2. Set up your Stripe account and get your API keys from the [Stripe Dashboard](https://dashboard.stripe.com/apikeys).

## Implementation

Add the following code to your backend server:

```javascript
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { authenticateJWT } = require('../middleware/auth'); // Your authentication middleware
const { PlanModel, SubscriptionModel } = require('../models'); // Your database models

/**
 * Create a Stripe checkout session
 * POST /user/me/saas/checkout/stripe
 */
router.post('/user/me/saas/checkout/stripe', authenticateJWT, async (req, res) => {
  try {
    const { planId, successUrl, cancelUrl } = req.body;
    const userId = req.user.id;

    // Find the plan in your database
    const plan = await PlanModel.findById(planId);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: plan.currency.toLowerCase(),
            product_data: {
              name: plan.name,
              description: plan.description,
            },
            unit_amount: plan.priceCents, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        userId: userId,
        planId: planId,
      },
    });

    // Return the session ID to the client
    return res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

/**
 * Verify a Stripe checkout session
 * POST /user/me/saas/checkout/stripe/verify
 */
router.post('/user/me/saas/checkout/stripe/verify', authenticateJWT, async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user.id;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    // Verify that the session is completed and belongs to this user
    if (session.payment_status !== 'paid') {
      return res.json({ verified: false });
    }
    
    if (session.metadata.userId !== userId) {
      return res.json({ verified: false });
    }
    
    // Find the subscription in your database
    const subscription = await SubscriptionModel.findOne({
      userId: userId,
      paymentId: sessionId,
      status: 'active'
    });
    
    if (!subscription) {
      return res.json({ verified: false });
    }
    
    return res.json({ 
      verified: true,
      subscriptionId: subscription._id
    });
  } catch (error) {
    console.error('Error verifying checkout session:', error);
    return res.status(500).json({ error: 'Failed to verify checkout session' });
  }
});

/**
 * Handle Stripe webhook for checkout completion
 * POST /webhooks/stripe
 * (This endpoint should be public and not require authentication)
 */
router.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Extract metadata
    const { userId, planId } = session.metadata;
    
    try {
      // Get the plan details
      const plan = await PlanModel.findById(planId);
      if (!plan) {
        return res.status(404).send('Plan not found');
      }

      // Calculate subscription end date
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + plan.days);

      // Create a new subscription in your database
      const subscription = new SubscriptionModel({
        userId: userId,
        planId: planId,
        startDate: startDate,
        endDate: endDate,
        paymentProvider: 'stripe',
        paymentId: session.id,
        status: 'active',
      });

      await subscription.save();
    } catch (error) {
      console.error('Error processing successful payment:', error);
      return res.status(500).send('Failed to process payment');
    }
  }

  res.status(200).send('Success');
});

module.exports = router;
```

## Environment Variables

Add the following environment variables to your server:

```
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## Configure Stripe Webhooks

1. Go to the [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Add a new webhook endpoint with the URL pointing to your `/webhooks/stripe` endpoint
3. Select the following events to listen for:
   - `checkout.session.completed`
4. Save the webhook and note the signing secret
5. Add this signing secret to your server's environment variables as `STRIPE_WEBHOOK_SECRET`

## Handling Successful Payments

When a payment is successful:
1. Stripe will call your webhook endpoint
2. Your server will create a new subscription in your database
3. The user will be redirected to the success URL you provided

## Testing

Use Stripe's test mode and test cards to verify your implementation:
- Test card number: `4242 4242 4242 4242`
- Any future expiration date
- Any 3-digit CVC
- Any postal code

## Going to Production

When you're ready to go live:
1. Switch to your live Stripe API keys
2. Update your webhook endpoints to point to your production server
3. Test the full flow with a real payment
