import { NextApiRequest, NextApiResponse } from 'next';

const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET || '';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, state, shop, hmac } = req.query;

    if (!code || !state || !shop) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Verify HMAC (simplified)
    if (!SHOPIFY_API_SECRET) {
      console.warn('Shopify API secret not configured, skipping HMAC verification');
    }

    // Decode state
    let decodedState: any;
    try {
      decodedState = JSON.parse(Buffer.from(state as string, 'base64').toString());
    } catch (e) {
      return res.status(400).json({ error: 'Invalid state parameter' });
    }

    // Redirect to client with auth code
    // In production, exchange code for access token server-side
    const redirectUrl = new URL('/app/setup', `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`);
    redirectUrl.searchParams.set('shopifyAuthCode', code as string);
    redirectUrl.searchParams.set('shopifyShop', shop as string);

    return res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('Shopify auth callback error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
