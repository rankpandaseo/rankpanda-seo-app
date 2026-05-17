import { redirect, json, type LoaderFunctionArgs, type ActionFunction } from '@remix-run/node';
import { useLoaderData, useActionData, Form } from '@remix-run/react';
import { getSession } from '~/lib/session.server';
import { db } from '~/lib/db.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get('cookie'));
  const userId = session.get('userId');

  if (!userId) {
    return redirect('/auth/login');
  }

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.status !== 'active') {
    return redirect('/auth/login');
  }

  const url = new URL(request.url);
  const shopifyAccessToken = url.searchParams.get('shopifyAccessToken');
  const shopifyShop = url.searchParams.get('shopifyShop');
  const shopifyScope = url.searchParams.get('shopifyScope');
  const shopifyError = url.searchParams.get('shopifyError');

  return json({
    user: { email: user.email, id: user.id },
    shopifyAccessToken,
    shopifyShop,
    shopifyScope,
    shopifyError,
  });
}

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const session = await getSession(request.headers.get('cookie'));
  const userId = session.get('userId');

  if (!userId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.status !== 'active') {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const actionType = formData.get('_action') as string;

  if (actionType === 'createProject') {
    const projectName = formData.get('projectName') as string;
    const shopDomain = formData.get('shopDomain') as string;
    const shopifyAccessToken = formData.get('shopifyAccessToken') as string;

    if (!projectName || !shopDomain || !shopifyAccessToken) {
      return json({ error: 'All fields are required' }, { status: 400 });
    }

    try {
      const projeto = await db.projeto.create({
        data: {
          userId,
          shopName: projectName,
          shopDomain,
          shopifyAccessToken,
        },
      });

      return json({ success: true, projectId: projeto.id });
    } catch (error) {
      console.error('Error creating project:', error);
      return json({ error: 'Failed to create project' }, { status: 500 });
    }
  }

  return json({ error: 'Invalid action' }, { status: 400 });
};

export default function SetupPage() {
  const { user, shopifyAccessToken, shopifyShop, shopifyScope, shopifyError } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const initiateOAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const shopDomain = formData.get('shopDomain') as string;

    if (!shopDomain) {
      alert('Por favor, insere o domínio da loja Shopify');
      return;
    }

    try {
      const response = await fetch('/api/shopify/auth-init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopDomain }),
      });

      if (!response.ok) {
        alert('Erro ao inicializar autenticação Shopify');
        return;
      }

      const { authUrl } = await response.json();
      window.location.href = authUrl;
    } catch (error) {
      console.error('OAuth error:', error);
      alert('Erro ao inicializar autenticação Shopify');
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '4px',
      padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <h1 style={{ marginTop: 0, marginBottom: '1.5rem' }}>
        Configuração da Loja Shopify
      </h1>

      {shopifyError && (
        <div style={{
          padding: '0.75rem',
          backgroundColor: '#ffebee',
          borderRadius: '4px',
          color: '#c62828',
          marginBottom: '1.5rem',
          borderLeft: '4px solid #f44336'
        }}>
          Erro: {shopifyError}
        </div>
      )}

      {actionData?.error && (
        <div style={{
          padding: '0.75rem',
          backgroundColor: '#ffebee',
          borderRadius: '4px',
          color: '#c62828',
          marginBottom: '1.5rem',
          borderLeft: '4px solid #f44336'
        }}>
          Erro: {actionData.error}
        </div>
      )}

      {!shopifyAccessToken ? (
        <form onSubmit={initiateOAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Domínio da Loja Shopify
            </label>
            <input
              type="text"
              name="shopDomain"
              placeholder="exemplo.myshopify.com"
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '0.9rem',
                boxSizing: 'border-box'
              }}
            />
            <small style={{ display: 'block', marginTop: '0.25rem', color: '#999' }}>
              Insere o domínio completo da tua loja Shopify
            </small>
          </div>

          <button
            type="submit"
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#0071e3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}
          >
            Conectar Shopify
          </button>
        </form>
      ) : (
        <Form method="post" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input type="hidden" name="_action" value="createProject" />
          <input type="hidden" name="shopifyAccessToken" value={shopifyAccessToken} />
          <input type="hidden" name="shopDomain" value={shopifyShop || ''} />

          <div style={{ padding: '1rem', backgroundColor: '#e8f5e9', borderRadius: '4px', borderLeft: '4px solid #4CAF50' }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: '#2e7d32' }}>
              ✅ Conectado com sucesso!
            </p>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#555' }}>
              Loja: <strong>{shopifyShop}</strong>
            </p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#666' }}>
              Scope: {shopifyScope}
            </p>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Nome do Projeto
            </label>
            <input
              type="text"
              name="projectName"
              placeholder="Ex: Loja Principal Vibradores"
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '0.9rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}
          >
            Criar Projeto
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#999', margin: '1rem 0 0 0' }}>
            <a
              href="/app/setup"
              style={{ color: '#0071e3', textDecoration: 'none' }}
            >
              Conectar outra loja
            </a>
          </p>
        </Form>
      )}
    </div>
  );
}
