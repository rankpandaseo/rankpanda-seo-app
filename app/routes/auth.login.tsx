import { useState } from 'react';
import { redirect, json, type ActionFunction, type LoaderFunction } from '@remix-run/node';
import { useActionData, Form, useNavigation, useSearchParams } from '@remix-run/react';
import { getSession, commitSession } from '~/lib/session.server';
import { verifyPassword } from '~/lib/auth.server';
import { db } from '~/lib/db.server';

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get('Cookie'));
  if (session.has('userId')) {
    return redirect('/app');
  }
  return null;
};

type ActionData = {
  error?: string;
};

export const action: ActionFunction = async ({ request }) => {
  console.log('[auth.login] POST request received');

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    console.log('[auth.login] parsing formData...');
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    console.log('[auth.login] form parsed:', { email: email?.substring(0, 3) + '***' });

    if (!email || !password) {
      console.log('[auth.login] missing email or password');
      return json({ error: 'Email e password são obrigatórios' }, { status: 400 });
    }

    console.log('[auth.login] querying user by email...');
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      console.log('[auth.login] user not found');
      return json({ error: 'Email ou password incorretos' }, { status: 401 });
    }
    console.log('[auth.login] user found:', { id: user.id, status: user.status });

    console.log('[auth.login] verifying password...');
    const passwordValid = await verifyPassword(password, user.password);
    if (!passwordValid) {
      console.log('[auth.login] password invalid');
      return json({ error: 'Email ou password incorretos' }, { status: 401 });
    }
    console.log('[auth.login] password valid');

    if (user.status === 'pending') {
      console.log('[auth.login] user pending approval');
      return json(
        { error: 'A tua conta está em análise. Um administrador irá aprová-la em breve.' },
        { status: 403 }
      );
    }

    if (user.status === 'banned') {
      console.log('[auth.login] user banned');
      return json({ error: 'A tua conta foi bloqueada.' }, { status: 403 });
    }

    console.log('[auth.login] creating session...');
    const session = await getSession(request.headers.get('Cookie'));
    session.set('userId', user.id);
    console.log('[auth.login] committing session...');
    const sessionCookie = await commitSession(session);
    console.log('[auth.login] session committed, redirecting to /app');

    return redirect('/app', {
      headers: {
        'Set-Cookie': sessionCookie,
      },
    });
  } catch (error) {
    console.error('[auth.login] UNEXPECTED ERROR:', error);
    return json({ error: 'Erro ao fazer login' }, { status: 500 });
  }
};

export default function LoginPage() {
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isSubmitting = navigation.state === 'submitting';
  const accessDenied = searchParams.get('error') === 'access_denied';

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Login</h1>

      {accessDenied && (
        <div style={{
          padding: '0.75rem',
          backgroundColor: '#fdd',
          borderLeft: '4px solid #c00',
          color: '#c00',
          marginBottom: '1rem'
        }}>
          A tua sessão expirou. Por favor, entra novamente.
        </div>
      )}

      <Form method="POST" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            disabled={isSubmitting}
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '1rem',
            }}
          />
        </div>

        <div>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            disabled={isSubmitting}
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '1rem',
            }}
          />
        </div>

        {actionData?.error && (
          <div style={{
            padding: '0.75rem',
            backgroundColor: '#fdd',
            borderLeft: '4px solid #c00',
            color: '#c00'
          }}>
            {actionData.error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#0071e3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.6 : 1,
          }}
        >
          {isSubmitting ? 'A entrar...' : 'Entrar'}
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#666' }}>
          Não tens conta? <a href="/auth/signup" style={{ color: '#0071e3', textDecoration: 'none' }}>Regista-te aqui</a>
        </p>
      </Form>
    </div>
  );
}
