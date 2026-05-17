import { json, type ActionFunction } from '@remix-run/node';
import crypto from 'crypto';

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY || '';
const SHOPIFY_AUTH_REDIRECT_URI = process.env.SHOPIFY_AUTH_REDIRECT_URI || 'http://localhost:3000/api/shopify/auth-callback';

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { shopDomain } = await request.json();

    if (!shopDomain) {
      return json({ error: 'Shop domain required' }, { status: 400 });
    }

    if (!SHOPIFY_API_KEY) {
      return json({ error: 'Shopify API key not configured' }, { status: 500 });
    }

    // Generate nonce for CSRF protection
    const nonce = crypto.randomBytes(16).toString('hex');

    // Store nonce in state (base64 encoded)
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

    return json({
      authUrl: authUrl.toString(),
      state: encodedState,
    });
  } catch (error) {
    console.error('Shopify auth init error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
