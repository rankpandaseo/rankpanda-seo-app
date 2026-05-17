import { redirect, json, type LoaderFunctionArgs, type ActionFunction } from '@remix-run/node';
import { useLoaderData, Form, useActionData } from '@remix-run/react';
import { getSession } from '~/lib/session.server';
import { db } from '~/lib/db.server';
import bcryptjs from 'bcryptjs';
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

  return json({ user: { email: user.email, id: user.id } });
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

  if (actionType === 'changePassword') {
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return json({ error: 'Todos os campos são obrigatórios' }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return json({ error: 'As senhas não coincidem' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return json({ error: 'A senha deve ter pelo menos 8 caracteres' }, { status: 400 });
    }

    const passwordValid = await bcryptjs.compare(currentPassword, user.password);
    if (!passwordValid) {
      return json({ error: 'Senha atual incorreta' }, { status: 400 });
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    await db.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return json({ success: true, message: 'Senha alterada com sucesso' });
  }

  return json({ error: 'Invalid action' }, { status: 400 });
};

export default function SettingsPage() {
  const { user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: spacing.lg,
        '@media (max-width: 768px)': {
          gridTemplateColumns: '1fr',
        },
      }}
    >
      {/* Informações da Conta */}
      <div
        style={{
          backgroundColor: colors.white,
          borderRadius: '8px',
          padding: spacing.xl,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h2
          style={{
            margin: 0,
            marginBottom: spacing.lg,
            fontSize: '20px',
            fontWeight: 600,
            color: colors.gray900,
          }}
        >
          Informações da Conta
        </h2>

        <div style={{ marginBottom: spacing.lg }}>
          <label
            style={{
              display: 'block',
              marginBottom: spacing.sm,
              fontSize: '14px',
              color: colors.gray700,
              fontWeight: 600,
            }}
          >
            Email
          </label>
          <p
            style={{
              margin: 0,
              padding: spacing.md,
              backgroundColor: colors.gray100,
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '14px',
              color: colors.gray900,
            }}
          >
            {user.email}
          </p>
        </div>

        <div style={{ marginBottom: spacing.lg }}>
          <label
            style={{
              display: 'block',
              marginBottom: spacing.sm,
              fontSize: '14px',
              color: colors.gray700,
              fontWeight: 600,
            }}
          >
            ID do Utilizador
          </label>
          <p
            style={{
              margin: 0,
              padding: spacing.md,
              backgroundColor: colors.gray100,
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '12px',
              color: colors.gray900,
            }}
          >
            {user.id}
          </p>
        </div>

        <div
          style={{
            padding: spacing.md,
            backgroundColor: '#E3F2FD',
            borderRadius: '4px',
            borderLeft: `4px solid ${colors.primary}`,
          }}
        >
          <p
            style={{
              margin: 0,
              marginBottom: spacing.sm,
              fontSize: '14px',
              color: colors.primary,
              fontWeight: 600,
            }}
          >
            Status: Ativo
          </p>
          <p
            style={{
              margin: 0,
              fontSize: '12px',
              color: colors.gray700,
            }}
          >
            A tua conta está verificada e pronta a utilizar.
          </p>
        </div>
      </div>

      {/* Alterar Senha */}
      <div
        style={{
          backgroundColor: colors.white,
          borderRadius: '8px',
          padding: spacing.xl,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h2
          style={{
            margin: 0,
            marginBottom: spacing.lg,
            fontSize: '20px',
            fontWeight: 600,
            color: colors.gray900,
          }}
        >
          Alterar Senha
        </h2>

        <Form method="post" style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
          <input type="hidden" name="_action" value="changePassword" />

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
              Senha Atual
            </label>
            <input
              type="password"
              name="currentPassword"
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
              Nova Senha
            </label>
            <input
              type="password"
              name="newPassword"
              required
              minLength={8}
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
              Mínimo 8 caracteres
            </small>
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
              Confirmar Senha
            </label>
            <input
              type="password"
              name="confirmPassword"
              required
              minLength={8}
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
            Alterar Senha
          </button>

          {actionData?.success && (
            <div
              style={{
                padding: spacing.md,
                backgroundColor: '#E8F5E9',
                borderRadius: '4px',
                borderLeft: `4px solid ${colors.success}`,
                color: colors.success,
                fontSize: '14px',
              }}
            >
              {actionData.message}
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
                fontSize: '14px',
              }}
            >
              {actionData.error}
            </div>
          )}
        </Form>
      </div>
    </div>
  );
}
