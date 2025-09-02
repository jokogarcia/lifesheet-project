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

        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { userId, subscriptionId } = paymentIntent.metadata;

        if (!userId || !subscriptionId) {
            console.error('Missing metadata in payment intent:', paymentIntent.metadata);
            throw new ApiError(400, 'Missing metadata');
        }
        const subscription = await SaaSSubscription.findById(subscriptionId);
        if (!subscription) {
            console.error('Subscription not found:', subscriptionId);
            throw new ApiError(404, 'Subscription not found');
        }

        switch (event.type) {
            case 'payment_intent.succeeded':

                await setSubscriptionActive(subscriptionId);
                break;

            case 'payment_intent.payment_failed':

                await setSubscriptionPaymentFailed(subscriptionId);

                break;

            default:
                throw new ApiError(400, 'unexpected event type');
        }

        res.status(200).send({});
    } catch (error) {
        next(error);
    }
});
export default router;
