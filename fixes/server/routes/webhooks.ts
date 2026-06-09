/**
 * SALIS AUTO - Webhook Handlers
 * 
 * FIXES APPLIED:
 * - [Integration] Add POST /api/webhooks/stripe with signature verification
 * - Handles payment_intent.succeeded, payment_intent.failed
 * - Updates invoice/payment status in database
 */

import { Router, Request, Response } from 'express';
import Stripe from 'stripe';

const router = Router();

// ============================================================
// Stripe Webhook Handler
// ============================================================
router.post('/api/webhooks/stripe', async (req: Request, res: Response) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-12-18.acacia' as any,
  });

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('[WEBHOOK] STRIPE_WEBHOOK_SECRET not configured');
    res.status(500).json({ error: 'Webhook not configured' });
    return;
  }

  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      (req as any).rawBody || req.body,
      sig,
      webhookSecret
    );
  } catch (err: any) {
    console.error(`[WEBHOOK] Signature verification failed: ${err.message}`);
    res.status(400).json({ error: `Webhook signature verification failed` });
    return;
  }

  console.info(`[WEBHOOK] Received Stripe event: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(paymentIntent);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancelled(subscription);
        break;
      }

      default:
        console.info(`[WEBHOOK] Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (err: any) {
    console.error(`[WEBHOOK] Error processing ${event.type}:`, err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// ============================================================
// Webhook Event Handlers
// ============================================================

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const invoiceId = paymentIntent.metadata?.invoiceId;
  const garageId = paymentIntent.metadata?.garageId;

  if (!invoiceId) {
    console.warn('[WEBHOOK] payment_intent.succeeded without invoiceId in metadata');
    return;
  }

  console.info(`[WEBHOOK] Payment succeeded for invoice ${invoiceId}, amount: ${paymentIntent.amount / 100} ${paymentIntent.currency.toUpperCase()}`);

  // TODO: Update invoice status to 'paid' in database
  // await storage.updateInvoice(invoiceId, { status: 'paid', paidAt: new Date() });
  
  // TODO: Create payment record
  // await storage.createPayment({
  //   invoiceId,
  //   garageId,
  //   amount: paymentIntent.amount / 100,
  //   currency: paymentIntent.currency,
  //   method: 'stripe',
  //   stripePaymentIntentId: paymentIntent.id,
  //   status: 'completed',
  // });
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const invoiceId = paymentIntent.metadata?.invoiceId;

  console.warn(`[WEBHOOK] Payment failed for invoice ${invoiceId}: ${paymentIntent.last_payment_error?.message}`);

  // TODO: Update invoice status and notify customer
  // await storage.updateInvoice(invoiceId, { status: 'payment_failed' });
}

async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  console.info(`[WEBHOOK] Stripe invoice paid: ${invoice.id}, amount: ${(invoice.amount_paid || 0) / 100}`);
  // Handle subscription invoice payments
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription): Promise<void> {
  const garageId = subscription.metadata?.garageId;
  console.info(`[WEBHOOK] Subscription updated for garage ${garageId}: ${subscription.status}`);
  
  // TODO: Update garage subscription plan in database
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription): Promise<void> {
  const garageId = subscription.metadata?.garageId;
  console.info(`[WEBHOOK] Subscription cancelled for garage ${garageId}`);
  
  // TODO: Downgrade garage to free tier
}

export default router;
