export const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY!;
export const PAYMOB_INTEGRATION_ID_CARD = process.env.PAYMOB_INTEGRATION_ID_CARD!; // Integration ID for Card
export const PAYMOB_INTEGRATION_ID_WALLET = process.env.PAYMOB_INTEGRATION_ID_WALLET!; // Integration ID for Mobile Wallets
export const PAYMOB_IFRAME_ID = process.env.PAYMOB_IFRAME_ID!;

const PAYMOB_BASE_URL = "https://accept.paymob.com/api";

export async function initiatePaymobPayment(
  orderId: string,
  amount: number,
  userData: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    street: string;
    city: string;
    building?: string;
    floor?: string;
    apartment?: string;
  },
  integrationType: "CARD" | "WALLET" = "CARD"
) {
  // 0. Validate Env Vars
  if (!PAYMOB_API_KEY) throw new Error("Missing PAYMOB_API_KEY");
  if (!PAYMOB_IFRAME_ID) throw new Error("Missing PAYMOB_IFRAME_ID");
  
  const integrationId = integrationType === "WALLET" ? PAYMOB_INTEGRATION_ID_WALLET : PAYMOB_INTEGRATION_ID_CARD;
  if (!integrationId) throw new Error(`Missing integration ID for ${integrationType}`);

  const token = await getAuthToken();
  const amountCents = amount * 100;

  // 1. Register Order
  const paymobOrderId = await registerOrder(token, amountCents, orderId, []);
  
  // 2. Billing Data
  const billingData = {
    apartment: userData.apartment || "NA",
    email: userData.email,
    floor: userData.floor || "NA",
    first_name: userData.first_name,
    street: userData.street,
    building: userData.building || "NA",
    phone_number: userData.phone_number,
    shipping_method: "NA",
    postal_code: "NA",
    city: userData.city,
    country: "EG",
    last_name: userData.last_name,
    state: "NA",
  };

  // 3. Get Payment Key
  const paymentKey = await getPaymentKey(token, paymobOrderId, amountCents, billingData, integrationId);

  if (!paymentKey) {
      throw new Error("Failed to retrieve payment key (undefined response)");
  }

  return {
    paymentKey,
    paymobOrderId,
    iframeId: PAYMOB_IFRAME_ID
  };
}

// Helper: Enhanced Fetch Wrapper
async function fetchPaymob(url: string, body: any, stepName: string) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
        console.error(`Paymob ${stepName} Error:`, data);
        throw new Error(`Paymob ${stepName} Failed: ${JSON.stringify(data)}`);
    }
    
    return data;
}

// 1. Authenticate Request
async function getAuthToken() {
    const data = await fetchPaymob(`${PAYMOB_BASE_URL}/auth/tokens`, { api_key: PAYMOB_API_KEY }, "Auth");
    return data.token;
}

// 2. Order Registration API
async function registerOrder(token: string, amountCents: number, merchantOrderId: string, items: any[]) {
    const data = await fetchPaymob(`${PAYMOB_BASE_URL}/ecommerce/orders`, {
        auth_token: token,
        delivery_needed: "false",
        amount_cents: amountCents,
        currency: "EGP",
        merchant_order_id: merchantOrderId,
        items: items,
    }, "Order Reg");
    return data.id;
}

// 3. Payment Key Request
async function getPaymentKey(
  token: string,
  paymobOrderId: string,
  amountCents: number,
  billingData: any,
  integrationId: string
) {
    const data = await fetchPaymob(`${PAYMOB_BASE_URL}/acceptance/payment_keys`, {
        auth_token: token,
        amount_cents: amountCents,
        expiration: 3600,
        order_id: paymobOrderId,
        billing_data: billingData,
        currency: "EGP",
        integration_id: integrationId,
        lock_order_when_paid: "false",
    }, "Payment Key");
    return data.token;
}
