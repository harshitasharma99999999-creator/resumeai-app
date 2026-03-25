import { NextResponse } from 'next/server';

const PROD_URL = 'https://resumeoptimizer-kappa.vercel.app';

export async function POST(request: Request) {
  const apiKey = process.env.DODO_PAYMENTS_API_KEY;
  const productId = process.env.DODO_PRODUCT_ID;
  const baseUrl = process.env.NEXT_PUBLIC_URL || PROD_URL;
  const successUrl = baseUrl + '/success';

  if (!apiKey) {
    return NextResponse.json({ error: 'Payment not configured.' }, { status: 500 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const email = body.email || 'customer@example.com';

    // Use checkout-sessions if we have a product_id
    if (productId) {
      const response = await fetch('https://live.dodopayments.com/checkout-sessions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_cart: [{ product_id: productId, quantity: 1 }],
          customer: { email },
          return_url: successUrl,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const url = data.checkout_url || data.url || data.payment_link;
        if (url) {
          return NextResponse.json({ url });
        }
      } else {
        const errorData = await response.json();
        console.error('Checkout session error:', errorData);
      }
    }

    // Fallback: try payment-links endpoint
    const linkRes = await fetch('https://live.dodopayments.com/payment-links', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 900,
        currency: 'usd',
        title: 'ResumeAI — Lifetime Access',
        description: 'AI-powered resume optimizer. One-time payment.',
        success_url: successUrl,
        customer_email: email,
      }),
    });

    if (linkRes.ok) {
      const linkData = await linkRes.json();
      const url = linkData.url || linkData.payment_link || linkData.payment_url;
      if (url) {
        return NextResponse.json({ url });
      }
    }

    // Fallback: try payments endpoint with payment_link flag
    const payRes = await fetch('https://live.dodopayments.com/payments', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer: { email, name: 'Customer' },
        billing: { city: 'NA', country: 'US', state: 'NA', street: 'NA', zipcode: 10001 },
        product_cart: [{ product_id: productId || 'resumeai-lifetime', quantity: 1 }],
        payment_link: true,
        return_url: successUrl,
      }),
    });

    if (payRes.ok) {
      const payData = await payRes.json();
      const url = payData.payment_link || payData.url || payData.checkout_url;
      if (url) {
        return NextResponse.json({ url });
      }
    }

    return NextResponse.json(
      { error: 'Payment service is being set up. Please contact us at resumeai@gmail.com to complete your purchase.' },
      { status: 503 }
    );
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Payment error. Please email resumeai@gmail.com to complete your purchase.' },
      { status: 500 }
    );
  }
}
