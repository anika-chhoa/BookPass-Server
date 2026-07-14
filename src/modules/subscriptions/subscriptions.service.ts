import { ObjectId } from "mongodb";
import type Stripe from "stripe";
import { stripe } from "../../config/stripe";
import { env } from "../../config/env";
import { PLANS } from "../../config/plans";
import { usersCollection } from "../auth/auth.types";
import { paymentsCollection, type PaymentDoc } from "./payment.types";
import { AppError } from "../../middlewares/errorHandler";

const PRICE_ID_TO_PLAN: Record<string, "pro" | "premium"> = {
  [PLANS.pro.stripePriceId!]: "pro",
  [PLANS.premium.stripePriceId!]: "premium",
};

function requireStripe(): Stripe {
  if (!stripe) throw new AppError("Stripe is not configured", 500);
  return stripe;
}

export async function createCheckoutSession(userId: string, plan: "pro" | "premium") {
  const stripeClient = requireStripe();

  const user = await usersCollection().findOne({ _id: new ObjectId(userId) });
  if (!user) throw new AppError("User not found", 404);

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripeClient.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user._id!.toString() },
    });
    customerId = customer.id;
    await usersCollection().updateOne(
      { _id: user._id },
      { $set: { stripeCustomerId: customerId } }
    );
  }

  const priceId = PLANS[plan].stripePriceId;
  if (!priceId) throw new AppError(`No Stripe price configured for plan: ${plan}`, 500);

  const session = await stripeClient.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${env.CLIENT_URL}/checkout/success`,
    cancel_url: `${env.CLIENT_URL}/pricing?checkout=cancelled`,
    metadata: { userId: user._id!.toString(), plan },
    subscription_data: {
      metadata: { userId: user._id!.toString(), plan },
    },
  });

  if (!session.url) throw new AppError("Failed to create checkout session", 500);
  return { url: session.url };
}

export async function handleStripeWebhook(rawBody: Buffer, signature: string) {
  const stripeClient = requireStripe();
  if (!env.STRIPE_WEBHOOK_SECRET) throw new AppError("Webhook secret not configured", 500);

  let event: Stripe.Event;
  try {
    event = stripeClient.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    throw new AppError(`Webhook signature verification failed: ${(err as Error).message}`, 400);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan as "pro" | "premium" | undefined;
      const subscriptionId =
        typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

      if (userId && plan && subscriptionId) {
        const user = await usersCollection().findOneAndUpdate(
          { _id: new ObjectId(userId) },
          { $set: { plan, stripeSubscriptionId: subscriptionId } },
          { returnDocument: "after" }
        );

        if (user) {
          const paymentDoc: PaymentDoc = {
            userId: user._id!,
            userName: user.name,
            userEmail: user.email,
            plan,
            amountTotal: session.amount_total ?? 0,
            currency: session.currency ?? "usd",
            stripeSessionId: session.id,
            stripeSubscriptionId: subscriptionId,
            status: "paid",
            createdAt: new Date(),
          };
          await paymentsCollection().insertOne(paymentDoc);
        }
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const priceId = subscription.items.data[0]?.price.id;
      const plan = priceId ? PRICE_ID_TO_PLAN[priceId] : undefined;
      const userId = subscription.metadata?.userId;

      if (userId && plan && subscription.status === "active") {
        await usersCollection().updateOne({ _id: new ObjectId(userId) }, { $set: { plan } });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;

      if (userId) {
        await usersCollection().updateOne(
          { _id: new ObjectId(userId) },
          { $set: { plan: "free" }, $unset: { stripeSubscriptionId: "" } }
        );
      }
      break;
    }

    default:
      break;
  }
}