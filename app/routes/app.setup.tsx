import { useState } from 'react';
import { redirect, json, type LoaderFunctionArgs, type ActionFunction } from '@remix-run/node';
import { useLoaderData, useActionData, Form } from '@remix-run/react';
import { getSession } from '~/lib/session.server';
import { db } from '~/lib/db.server';
import { colors, spacing } from '~/design-system';

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
  const [shopDomain, setShopDomain] = useState('');

  const initiateOAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const domain = formData.get('shopDomain') as string;

    if (!domain) {
      alert('Por favor, insere o domínio da loja Shopify');
      return;
    }

    try {
      const response = await fetch('/api/shopify/auth-init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopDomain: domain }),
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
    <div
      style={{
        backgroundColor: colors.white,
        borderRadius: '8px',
        padding: spacing.xl,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        maxWidth: '500px',
        margin: '0 auto',
      }}
    >
      <h1
        style={{
          margin: 0,
          marginBottom: spacing.lg,
          fontSize: '24px',
          fontWeight: 600,
          color: colors.gray900,
        }}
      >
        Configuração da Loja Shopify
      </h1>

      {shopifyError && (
        <div
          style={{
            padding: spacing.md,
            backgroundColor: '#FFEBEE',
            borderRadius: '4px',
            borderLeft: `4px solid ${colors.critical}`,
            color: colors.critical,
            marginBottom: spacing.lg,
            fontSize: '14px',
          }}
        >
          Erro: {shopifyError}
        </div>
      )}

      {actionData?.error && (
        <div
          style={{
            padding: spacing.md,
            backgroundColor: '#FFEBEE',
            borderRadius: '4px',
            borderLeft: `4px solid ${colors.critical}`,
            color: colors.critical,
            marginBottom: spacing.lg,
            fontSize: '14px',
          }}
        >
          Erro: {actionData.error}
        </div>
      )}

      {!shopifyAccessToken ? (
        <form
          onSubmit={initiateOAuth}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: spacing.md,
          }}
        >
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: spacing.sm,
                fontWeight: 600,
                fontSize: '14px',
                color: colors.gray900,
              }}
            >
              Domínio da Loja Shopify
            </label>
            <input
              type="text"
              name="shopDomain"
              value={shopDomain}
              onChange={(e) => setShopDomain(e.target.value)}
              placeholder="exemplo.myshopify.com"
              required
              style={{
                width: '100%',
                padding: `${spacing.sm} ${spacing.md}`,
                border: `1px solid ${colors.gray300}`,
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
            />
            <small
              style={{
                display: 'block',
                marginTop: spacing.xs,
                color: colors.gray600,
                fontSize: '12px',
              }}
            >
              Insere o domínio completo da tua loja Shopify
            </small>
          </div>

          <button
            type="submit"
            style={{
              padding: `${spacing.sm} ${spacing.md}`,
              backgroundColor: colors.primary,
              color: colors.white,
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              transition: 'all 200ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.primaryDark;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.primary;
            }}
          >
            Conectar Shopify
          </button>
        </form>
      ) : (
        <Form
          method="post"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: spacing.md,
          }}
        >
          <input type="hidden" name="_action" value="createProject" />
          <input type="hidden" name="shopifyAccessToken" value={shopifyAccessToken} />
          <input type="hidden" name="shopDomain" value={shopifyShop || ''} />

          <div
            style={{
              padding: spacing.md,
              backgroundColor: '#E8F5E9',
              borderRadius: '4px',
              borderLeft: `4px solid ${colors.success}`,
            }}
          >
            <p
              style={{
                margin: 0,
                marginBottom: spacing.sm,
                fontWeight: 600,
                fontSize: '14px',
                color: colors.success,
              }}
            >
              Conectado com sucesso!
            </p>
            <p
              style={{
                margin: 0,
                fontSize: '14px',
                color: colors.gray700,
              }}
            >
              Loja: <strong>{shopifyShop}</strong>
            </p>
            <p
              style={{
                margin: `${spacing.sm} 0 0 0`,
                fontSize: '12px',
                color: colors.gray600,
              }}
            >
              Scope: {shopifyScope}
            </p>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: spacing.sm,
                fontWeight: 600,
                fontSize: '14px',
                color: colors.gray900,
              }}
            >
              Nome do Projeto
            </label>
            <input
              type="text"
              name="projectName"
              placeholder="Ex: Loja Principal Vibradores"
              required
              style={{
                width: '100%',
                padding: `${spacing.sm} ${spacing.md}`,
                border: `1px solid ${colors.gray300}`,
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              padding: `${spacing.sm} ${spacing.md}`,
              backgroundColor: colors.success,
              color: colors.white,
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              transition: 'all 200ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#388E3C';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.success;
            }}
          >
            Criar Projeto
          </button>

          <p
            style={{
              textAlign: 'center',
              fontSize: '12px',
              color: colors.gray600,
              margin: `${spacing.lg} 0 0 0`,
            }}
          >
            <a
              href="/app/setup"
              style={{
                color: colors.primary,
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Conectar outra loja
            </a>
          </p>
        </Form>
      )}
    </div>
  );
}
