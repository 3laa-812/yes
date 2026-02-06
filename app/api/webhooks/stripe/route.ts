import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Stripe } from "stripe";
import db from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-12-18.acacia" as any, // Updated api version or keep generic string if needed, sticking to standard recent string or "2023-10-16"
  typescript: true,
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
      // Create Order in DB
      await db.order.create({
          data: {
              userId: session.metadata?.userId === 'guest' ? undefined : session.metadata?.userId, // Handle guest vs user
              total: Number(session.amount_total) / 100, // Convert from cents
              status: "CONFIRMED",
              paymentStatus: "PAID",
              paymentMethod: "ONLINE",
              // In a real app we would map lineItems to OrderItems. 
              // Since Stripe line items structure differs from our internal structure, we'd need more logic here
              // or store a snapshot. For this demo, we'll mark as paid.
          }
      });
  }

  return new NextResponse(null, { status: 200 });
}
