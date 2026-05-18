import { useState } from 'react';
import { redirect, json, type ActionFunction, type LoaderFunction } from '@remix-run/node';
import { useActionData, Form, useNavigation, useSearchParams } from '@remix-run/react';
import { getSession, commitSession } from '~/lib/session.server';
import { verifyPassword } from '~/lib/auth.server';
import { db } from '~/lib/db.server';
import { FormField, ErrorAlert, WarningAlert, colors, spacing } from '~/design-system';

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get('Cookie'));
  if (session.has('userId')) {
    const userId = session.get('userId');
    const user = await db.user.findUnique({ where: { id: userId } });

    // Only redirect to /app if user status is active
    if (user && user.status === 'active') {
      return redirect('/app');
    }

    // If user exists but status is not active, or user doesn't exist:
    // Clear the invalid session to prevent redirect loop
    session.unset('userId');
    return json(null, {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
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
    console.log('[auth.login] password verification details:', {
      inputPasswordLength: password.length,
      storedHashLength: user.password?.length || 0,
      storedHashPreview: user.password?.substring(0, 20) + '...',
    });
    const passwordValid = await verifyPassword(password, user.password);
    console.log('[auth.login] password verification result:', passwordValid);
    if (!passwordValid) {
      console.log('[auth.login] password invalid - verification failed');
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
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: colors.gray100,
        padding: spacing.lg,
      }}
    >
      <div
        style={{
          backgroundColor: colors.white,
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          padding: spacing.xl,
          width: '100%',
          maxWidth: '400px',
        }}
      >
        <h1
          style={{
            margin: 0,
            marginBottom: spacing.lg,
            fontSize: '24px',
            fontWeight: 600,
            color: colors.gray900,
            textAlign: 'center',
          }}
        >
          Login
        </h1>

        {accessDenied && (
          <WarningAlert message="A tua sessão expirou. Por favor, entra novamente." />
        )}

        <Form method="POST" style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          <FormField
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
            autoComplete="email"
          />

          <FormField
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isSubmitting}
            autoComplete="current-password"
          />

          {actionData?.error && <ErrorAlert message={actionData.error} />}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: `${spacing.sm} ${spacing.md}`,
              marginTop: spacing.md,
              backgroundColor: colors.primary,
              color: colors.white,
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1,
              transition: 'all 200ms ease',
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.backgroundColor = colors.primaryDark;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.primary;
            }}
          >
            {isSubmitting ? 'A entrar...' : 'Entrar'}
          </button>

          <p
            style={{
              textAlign: 'center',
              fontSize: '14px',
              color: colors.gray700,
              marginTop: spacing.lg,
              margin: `${spacing.lg} 0 0 0`,
            }}
          >
            Não tens conta?{' '}
            <a
              href="/auth/signup"
              style={{
                color: colors.primary,
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Regista-te aqui
            </a>
          </p>
        </Form>
      </div>
    </div>
  );
}
