import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  
  // Paymob sends a lot of params. The most important for verification are keys sorted lexically.
  // Documentation: https://docs.paymob.com/docs/accept-callback-and-response
  
  const hmac = searchParams.get("hmac");
  const success = searchParams.get("success");
  const orderId = searchParams.get("merchant_order_id"); // This is OUR DB Order ID
  const txnId = searchParams.get("id"); // Paymob Transaction ID
  
  if (!hmac || !orderId) {
      return NextResponse.json({ error: "Invalid callback" }, { status: 400 });
  }

  const hmacSecret = process.env.PAYMOB_HMAC_SECRET;
  if (!hmacSecret) {
      console.error("Missing PAYMOB_HMAC_SECRET");
      return NextResponse.json({ error: "Configuration Error" }, { status: 500 });
  }

  // Paymob HMAC Calculation
  // Extract all query params
  const { 
    amount_cents, 
    created_at, 
    currency, 
    error_occured, 
    has_parent_transaction, 
    id, 
    integration_id, 
    is_auth, 
    is_capture, 
    is_refunded, 
    is_standalone_payment, 
    is_voided, 
    order, 
    owner, 
    pending, 
    source_data_pan, 
    source_data_sub_type, 
    source_data_type, 
    success: successParam
  } = Object.fromEntries(searchParams.entries());

  // Note: searchParams.get() returns null if not found, but we need empty string for concatenation 
  // or the exact value Paymob sent. Paymob usually sends all these.
  // We need to match the lexical order of keys specified in docs.
  
  const connectedString = [
      amount_cents,
      created_at,
      currency,
      error_occured,
      has_parent_transaction,
      id,
      integration_id,
      is_auth,
      is_capture,
      is_refunded,
      is_standalone_payment,
      is_voided,
      order,
      owner,
      pending,
      source_data_pan,
      source_data_sub_type,
      source_data_type,
      successParam
  ].map(val => val ?? "").join("");

  const calculatedHmac = crypto
      .createHmac("sha512", hmacSecret)
      .update(connectedString)
      .digest("hex");

  if (calculatedHmac !== hmac) {
      console.error("HMAC Mismatch:", { calculatedHmac, receivedHmac: hmac });
      return NextResponse.json({ error: "Invalid HMAC signature" }, { status: 403 });
  }

  const isSuccess = success === "true";

  try {
      if (isSuccess) {
          // Update Order and Payment
          await db.order.update({
              where: { id: orderId },
              data: {
                  status: "CONFIRMED", 
                  paymentStatus: "PAID"
              }
          });

          // Update or Create Payment record
          // We might have a pending payment record we want to update, or create a new one.
          // Let's just log it as a new transaction or update existing?
          // Simplest: Find the pending payment for this order and update it.
          const existingPayment = await db.payment.findFirst({
              where: { orderId: orderId, status: "PENDING" }
          });

          if (existingPayment) {
              await db.payment.update({
                  where: { id: existingPayment.id },
                  data: {
                      status: "PAID",
                      transactionId: txnId || existingPayment.transactionId
                  }
              });
          } else {
             // Fallback create
             await db.payment.create({
                 data: {
                     orderId: orderId,
                     amount: 0, // Should fetch real amount
                     provider: "PAYMOB",
                     status: "PAID",
                     transactionId: txnId || "unknown"
                 }
             });
          }

          // Redirect user to success
          return NextResponse.redirect(new URL(`/checkout/success?orderId=${orderId}`, req.url));

      } else {
          // Failed
           await db.order.update({
              where: { id: orderId },
              data: {
                  paymentStatus: "FAILED"
              }
          });

          return NextResponse.redirect(new URL(`/checkout/failed?orderId=${orderId}`, req.url));
      }

  } catch (error) {
      console.error("Callback Processing Error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
