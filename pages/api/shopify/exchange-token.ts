import { NextApiRequest, NextApiResponse } from 'next';

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY || '';
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET || '';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, shopDomain } = req.body;

    if (!code || !shopDomain) {
      return res.status(400).json({ error: 'Missing code or shopDomain' });
    }

    if (!SHOPIFY_API_KEY || !SHOPIFY_API_SECRET) {
      return res.status(500).json({ error: 'Shopify credentials not configured' });
    }

    const redirectUri = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}/api/shopify/auth-callback`;

    // Exchange auth code for access token
    const tokenResponse = await fetch(`https://${shopDomain}/admin/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: SHOPIFY_API_KEY,
        client_secret: SHOPIFY_API_SECRET,
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Shopify token exchange error:', error);
      return res.status(400).json({
        error: 'Failed to exchange code for access token',
        details: error,
      });
    }

    const tokenData = await tokenResponse.json();

    // Validate the token by making a test API call
    const validateResponse = await fetch(`https://${shopDomain}/admin/api/2024-01/shop.json`, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': tokenData.access_token,
        'Content-Type': 'application/json',
      },
    });

    if (!validateResponse.ok) {
      return res.status(400).json({ error: 'Token validation failed' });
    }

    const shopData = await validateResponse.json();

    return res.status(200).json({
      success: true,
      accessToken: tokenData.access_token,
      scope: tokenData.scope,
      shop: shopData.shop,
    });
  } catch (error) {
    console.error('Shopify exchange-token error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
