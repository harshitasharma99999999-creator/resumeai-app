import { NextResponse } from 'next/server';

const PROD_URL = 'https://resumeoptimizer-kappa.vercel.app';

export async function POST(request: Request) {
  const apiKey = process.env.DODO_PAYMENTS_API_KEY;
  const productId = process.env.DODO_PRODUCT_ID || 'pdt_0NbFEgCp1NU4vGDqHSLT4';
  const baseUrl = process.env.NEXT_PUBLIC_URL || PROD_URL;
  const successUrl = baseUrl + '/success';

  const body = await request.json().catch(() => ({}));
  const email = (body.email as string) || 'customer@example.com';

  try {
    const response = await fetch('https://live.dodopayments.com/payments', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer: { email, name: 'Customer' },
        billing: { city: 'New York', country: 'US', state: 'NY', street: '123 Main St', zipcode: 10001 },
        product_cart: [{ product_id: productId, quantity: 1 }],
        payment_link: true,
        return_url: successUrl,
      }),
    });

    const text = await response.text();

    if (response.ok) {
      const data = JSON.parse(text);
      const url = data.payment_link || data.url || data.checkout_url;
      if (url) {
        return NextResponse.json({ url });
      }
    }

    console.error('Dodo error:', text);
    return NextResponse.json({ error: 'Payment service error. Please try again.' }, { status: 503 });
  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: 'Payment error. Please try again.' }, { status: 500 });
  }
}
