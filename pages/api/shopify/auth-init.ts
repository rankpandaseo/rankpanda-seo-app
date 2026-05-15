import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY || '';
const SHOPIFY_AUTH_REDIRECT_URI = process.env.SHOPIFY_AUTH_REDIRECT_URI || 'http://localhost:3000/api/shopify/auth-callback';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { shopDomain } = req.body;

    if (!shopDomain) {
      return res.status(400).json({ error: 'Shop domain required' });
    }

    if (!SHOPIFY_API_KEY) {
      return res.status(500).json({ error: 'Shopify API key not configured' });
    }

    // Generate nonce for CSRF protection
    const nonce = crypto.randomBytes(16).toString('hex');

    // Store nonce in session (simplified - in production use secure session storage)
    const encodedState = Buffer.from(JSON.stringify({ nonce, shopDomain })).toString('base64');

    const scope = [
      'write_products',
      'read_products',
      'write_collections',
      'read_collections',
      'read_inventory',
    ].join(',');

    const authUrl = new URL(`https://${shopDomain}/admin/oauth/authorize`);
    authUrl.searchParams.set('client_id', SHOPIFY_API_KEY);
    authUrl.searchParams.set('scope', scope);
    authUrl.searchParams.set('redirect_uri', SHOPIFY_AUTH_REDIRECT_URI);
    authUrl.searchParams.set('state', encodedState);

    return res.status(200).json({
      authUrl: authUrl.toString(),
      state: encodedState,
    });
  } catch (error) {
    console.error('Shopify auth init error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
