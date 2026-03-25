import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const apiKey = process.env.DODO_PAYMENTS_API_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

  try {
    const body = await request.json().catch(() => ({}));
    const email = body.email || 'customer@example.com';

    const response = await fetch('https://api.dodopayments.com/payment_links', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currency: 'usd',
        amount: 900,
        redirect_url: `${baseUrl}/success`,
        title: 'ResumeAI — Get More Interviews',
        description: 'AI-powered resume optimizer, LinkedIn summary generator, and cover letter generator. One-time payment.',
        customer_email: email,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Dodo payment link error:', errorText);
      return NextResponse.json({ url: `${baseUrl}/success?demo=true` });
    }

    const data = await response.json();
    return NextResponse.json({ url: data.url || data.payment_link || `${baseUrl}/success?demo=true` });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/success?demo=true` });
  }
}
