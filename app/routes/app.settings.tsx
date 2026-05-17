import { redirect, json, type LoaderFunctionArgs, type ActionFunction } from '@remix-run/node';
import { useLoaderData, Form, useActionData } from '@remix-run/react';
import { getSession } from '~/lib/session.server';
import { db } from '~/lib/db.server';
import bcryptjs from 'bcryptjs';

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
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1.5rem'
    }}>
      {/* Informações da Conta */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '4px',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>
          Informações da Conta
        </h2>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666', fontWeight: 'bold' }}>
            Email
          </label>
          <p style={{ margin: 0, padding: '0.75rem', backgroundColor: '#f9f9f9', borderRadius: '4px', fontFamily: 'monospace' }}>
            {user.email}
          </p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666', fontWeight: 'bold' }}>
            ID do Utilizador
          </label>
          <p style={{ margin: 0, padding: '0.75rem', backgroundColor: '#f9f9f9', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.85rem' }}>
            {user.id}
          </p>
        </div>

        <div style={{ padding: '1rem', backgroundColor: '#e3f2fd', borderRadius: '4px', borderLeft: '4px solid #0071e3' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#0071e3', fontWeight: 'bold' }}>
            Status: Ativo
          </p>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#555' }}>
            A tua conta está verificada e pronta a utilizar.
          </p>
        </div>
      </div>

      {/* Alterar Senha */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '4px',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>
          Alterar Senha
        </h2>

        <Form method="post" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input type="hidden" name="_action" value="changePassword" />

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Senha Atual
            </label>
            <input
              type="password"
              name="currentPassword"
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

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Nova Senha
            </label>
            <input
              type="password"
              name="newPassword"
              required
              minLength={8}
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
              Mínimo 8 caracteres
            </small>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Confirmar Senha
            </label>
            <input
              type="password"
              name="confirmPassword"
              required
              minLength={8}
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
              backgroundColor: '#0071e3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}
          >
            Alterar Senha
          </button>

          {actionData?.success && (
            <div style={{ padding: '0.75rem', backgroundColor: '#e8f5e9', borderRadius: '4px', color: '#2e7d32', borderLeft: '4px solid #4CAF50' }}>
              ✅ {actionData.message}
            </div>
          )}

          {actionData?.error && (
            <div style={{ padding: '0.75rem', backgroundColor: '#ffebee', borderRadius: '4px', color: '#c62828', borderLeft: '4px solid #f44336' }}>
              ❌ {actionData.error}
            </div>
          )}
        </Form>
      </div>
    </div>
  );
}
