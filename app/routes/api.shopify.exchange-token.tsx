import { json, type ActionFunction } from '@remix-run/node';

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY || '';
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET || '';

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { code, shopDomain } = await request.json();

    if (!code || !shopDomain) {
      return json({ error: 'Missing code or shopDomain' }, { status: 400 });
    }

    if (!SHOPIFY_API_KEY || !SHOPIFY_API_SECRET) {
      return json({ error: 'Shopify credentials not configured' }, { status: 500 });
    }

    const url = new URL(request.url);
    const redirectUri = `${url.protocol}//${url.host}/api/shopify/auth-callback`;

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
      return json(
        {
          error: 'Failed to exchange code for access token',
          details: error,
        },
        { status: 400 }
      );
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
      return json({ error: 'Token validation failed' }, { status: 400 });
    }

    const shopData = await validateResponse.json();

    return json({
      success: true,
      accessToken: tokenData.access_token,
      scope: tokenData.scope,
      shop: shopData.shop,
    });
  } catch (error) {
    console.error('Shopify exchange-token error:', error);
    return json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
};
