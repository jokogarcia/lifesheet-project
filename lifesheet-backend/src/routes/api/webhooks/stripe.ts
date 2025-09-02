import { SaaSSubscription } from '../../../models/saaS-plan.model';
import { constants } from "../../../constants";
import { NextFunction, Router, Request, Response } from "express";
import { Stripe } from "stripe";
import { ApiError } from '../../../middleware/errorHandler';
import { setSubscriptionActive, setSubscriptionPaymentFailed } from '../../../services/saas';
import express from 'express';
const router = Router();

// Create a raw body parser for Stripe webhooks

router.post("/", express.raw({ type: 'application/json' }), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const signature = req.headers['stripe-signature'];
        if (!signature) {
            throw new ApiError(401, `invalid signature (${signature})`);
        }
        console.log("Webhook request received. Type of body", typeof req.body);
        const stripe = new Stripe(constants.STRIPE_SK);
        if (stripe == null) {
            throw new ApiError(500, `Cannot initialize Stripe`);
        }

        let event: Stripe.Event;
        try {
            event = stripe.webhooks.constructEvent(
                req.body, // req.body is now a Buffer thanks to the rawBodyParser
                signature,
                constants.STRIPE_WS
            );
        } catch (error) {
            throw new ApiError(401, `signature verification failed (${error})`);
        }

        console.log(`Received webhook event: ${event.type}`);

        // Handle different event types
        switch (event.type) {
            case 'checkout.session.completed':
            case 'checkout.session.async_payment_succeeded':
                {
                    const { subscription } = await getMetadata(event);
                    await setSubscriptionActive(subscription.id);
                    break;
                }
            case 'checkout.session.async_payment_failed':
            case 'checkout.session.expired':
                {
                    const { subscription } = await getMetadata(event);
                    // For payment failures, try to retrieve the session info
                    await setSubscriptionPaymentFailed(subscription.id);
                    break;
                }

            default:
                console.log(`Unhandled event type: ${event.type}`);
                res.status(200).send({}); // Still return 200 to acknowledge receipt
                return;
        }

        res.status(200).send({});
    } catch (error) {
        next(error);
    }
});
async function getMetadata(event: Stripe.Event) {
    const session = event.data.object as Stripe.Checkout.Session;
    const { userId, subscriptionId } = session.metadata || {};

    if (!userId || !subscriptionId) {
        console.error('Missing metadata in session:', session.metadata);
        throw new ApiError(400, 'Missing metadata in session');
    }
    const subscription = await SaaSSubscription.findById(subscriptionId);
    if (!subscription) {
        console.error('Subscription not found:', subscriptionId);
        throw new ApiError(404, 'Subscription not found');
    }
    return { userId, subscription };
}
export default router;
