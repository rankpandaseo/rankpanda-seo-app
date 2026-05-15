import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, state, shop, hmac } = req.query;

    if (!code || !state || !shop) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Decode state
    let decodedState: any;
    try {
      decodedState = JSON.parse(Buffer.from(state as string, 'base64').toString());
    } catch (e) {
      return res.status(400).json({ error: 'Invalid state parameter' });
    }

    // Exchange auth code for access token server-side
    const exchangeResponse = await fetch(
      `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}/api/shopify/exchange-token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code as string,
          shopDomain: shop as string,
        }),
      }
    );

    if (!exchangeResponse.ok) {
      console.error('Token exchange failed:', await exchangeResponse.text());
      const redirectUrl = new URL('/app/setup', `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`);
      redirectUrl.searchParams.set('shopifyError', 'Token exchange failed');
      return res.redirect(redirectUrl.toString());
    }

    const { accessToken, scope } = await exchangeResponse.json();

    // Redirect to client with access token
    const redirectUrl = new URL('/app/setup', `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`);
    redirectUrl.searchParams.set('shopifyAccessToken', accessToken);
    redirectUrl.searchParams.set('shopifyShop', shop as string);
    redirectUrl.searchParams.set('shopifyScope', scope);

    return res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('Shopify auth callback error:', error);
    const redirectUrl = new URL('/app/setup', `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`);
    redirectUrl.searchParams.set('shopifyError', 'Authorization failed');
    return res.redirect(redirectUrl.toString());
  }
}
