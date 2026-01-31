import Link from "next/link";
import { Stripe } from "stripe";
import { NextResponse } from "next/server";
import db from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2026-01-28.clover" as any, // Cast to any to avoid potential future mismatches during this session if types fluctuate
  typescript: true,
});

export async function POST(req: Request) {
  const body = await req.json();
  const { items, email } = body;

  if (!items || items.length === 0) {
    return new NextResponse("No items in checkout", { status: 400 });
  }

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item: any) => {
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: [item.image.startsWith('/') ? `${process.env.NEXT_PUBLIC_URL}${item.image}` : item.image],
          metadata: {
              productId: item.productId,
              size: item.size,
              color: item.color
          }
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    };
  });

  // Check if we are using the mock key
  if (process.env.STRIPE_SECRET_KEY === "sk_test_mock_key") {
      // Return a mock session URL that redirects to success
      return NextResponse.json({ 
          url: `${process.env.NEXT_PUBLIC_URL}/checkout/success?session_id=mock_session_123` 
      });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items,
    success_url: `${process.env.NEXT_PUBLIC_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/`,
    customer_email: email, // Optional: pre-fill email if available
    metadata: {
        userId: "guest", // Replace with actual user ID if auth'd
    }
  });

  return NextResponse.json({ url: session.url });
}
