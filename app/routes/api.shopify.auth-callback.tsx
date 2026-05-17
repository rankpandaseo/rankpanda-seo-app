import { redirect, type LoaderFunctionArgs } from '@remix-run/node';

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const shop = url.searchParams.get('shop');
    const hmac = url.searchParams.get('hmac');

    if (!code || !state || !shop) {
      const redirectUrl = new URL('/app/setup', url.origin);
      redirectUrl.searchParams.set('shopifyError', 'Missing required parameters');
      return redirect(redirectUrl.toString());
    }

    // Decode state
    let decodedState: any;
    try {
      decodedState = JSON.parse(Buffer.from(state as string, 'base64').toString());
    } catch (e) {
      const redirectUrl = new URL('/app/setup', url.origin);
      redirectUrl.searchParams.set('shopifyError', 'Invalid state parameter');
      return redirect(redirectUrl.toString());
    }

    // Exchange auth code for access token server-side
    const exchangeResponse = await fetch(
      `${url.protocol}//${url.host}/api/shopify/exchange-token`,
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
      const redirectUrl = new URL('/app/setup', url.origin);
      redirectUrl.searchParams.set('shopifyError', 'Token exchange failed');
      return redirect(redirectUrl.toString());
    }

    const { accessToken, scope } = await exchangeResponse.json();

    // Redirect to setup page with access token
    const redirectUrl = new URL('/app/setup', url.origin);
    redirectUrl.searchParams.set('shopifyAccessToken', accessToken);
    redirectUrl.searchParams.set('shopifyShop', shop as string);
    redirectUrl.searchParams.set('shopifyScope', scope);

    return redirect(redirectUrl.toString());
  } catch (error) {
    console.error('Shopify auth callback error:', error);
    const url = new URL(request.url);
    const redirectUrl = new URL('/app/setup', url.origin);
    redirectUrl.searchParams.set('shopifyError', 'Authorization failed');
    return redirect(redirectUrl.toString());
  }
}
