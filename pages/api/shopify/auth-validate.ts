import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { shopifyAccessToken, shopDomain } = req.body;

    if (!shopifyAccessToken || !shopDomain) {
      return res.status(400).json({ error: 'Missing accessToken or shopDomain', valid: false });
    }

    // Validate token by making a simple API call to Shopify
    const response = await fetch(`https://${shopDomain}/admin/api/2024-01/shop.json`, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': shopifyAccessToken,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return res.status(200).json({
        valid: true,
        shop: data.shop,
      });
    } else if (response.status === 401) {
      return res.status(200).json({
        valid: false,
        error: 'Unauthorized - token invalid or expired',
      });
    } else {
      return res.status(200).json({
        valid: false,
        error: `Shopify API error: ${response.status}`,
      });
    }
  } catch (error) {
    console.error('Shopify auth validate error:', error);
    return res.status(500).json({ error: 'Internal server error', valid: false });
  }
}
