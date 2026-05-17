import { useState } from 'react';
import { redirect, json, type ActionFunction, type LoaderFunction } from '@remix-run/node';
import { useActionData, Form, useNavigation } from '@remix-run/react';
import { getSession } from '~/lib/session.server';
import { hashPassword } from '~/lib/auth.server';
import { db } from '~/lib/db.server';
import { FormField, colors, spacing } from '~/design-system';

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get('Cookie'));
  if (session.has('userId')) {
    return redirect('/app');
  }
  return null;
};

type ActionData = {
  error?: string;
  success?: boolean;
};

export const action: ActionFunction = async ({ request }) => {
  console.log('[auth.signup] POST request received');

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    console.log('[auth.signup] parsing formData...');
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    console.log('[auth.signup] form parsed:', {
      email: email?.substring(0, 3) + '***',
      passwordLength: password?.length || 0,
      confirmPasswordLength: confirmPassword?.length || 0,
    });

    if (!email || !password || !confirmPassword) {
      console.log('[auth.signup] missing required fields', {
        hasEmail: !!email,
        hasPassword: !!password,
        hasConfirmPassword: !!confirmPassword,
      });
      return json({ error: 'Todos os campos são obrigatórios' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      console.log('[auth.signup] passwords do not match');
      return json({ error: 'As passwords não correspondem' }, { status: 400 });
    }

    if (password.length < 8) {
      console.log('[auth.signup] password too short');
      return json({ error: 'A password deve ter pelo menos 8 caracteres' }, { status: 400 });
    }

    console.log('[auth.signup] checking if email exists...');
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      console.log('[auth.signup] email already registered');
      return json({ error: 'Este email já está registado' }, { status: 400 });
    }

    console.log('[auth.signup] hashing password...');
    const hashedPassword = await hashPassword(password);
    console.log('[auth.signup] password hashed:', {
      originalLength: password.length,
      hashedLength: hashedPassword.length,
      hashedPreview: hashedPassword.substring(0, 20) + '...',
    });
    console.log('[auth.signup] creating user in database...');

    const createdUser = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        status: 'pending',
        role: 'user',
      },
    });

    console.log('[auth.signup] user created successfully', {
      userId: createdUser.id,
      email: createdUser.email,
      status: createdUser.status,
      storedPasswordLength: createdUser.password?.length || 0,
    });
    return json({ success: true } as ActionData);
  } catch (error) {
    console.error('[auth.signup] UNEXPECTED ERROR:', error);
    return json({ error: 'Erro ao criar conta' }, { status: 500 });
  }
};

export default function SignupPage() {
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const isSubmitting = navigation.state === 'submitting';

  if (actionData?.success) {
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
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              margin: 0,
              marginBottom: spacing.md,
              fontSize: '24px',
              fontWeight: 600,
              color: colors.gray900,
            }}
          >
            Conta criada com sucesso!
          </h1>
          <p
            style={{
              color: colors.gray700,
              marginBottom: spacing.md,
              fontSize: '14px',
            }}
          >
            A tua conta foi criada e está em análise. Um administrador aprovará o teu acesso em breve.
          </p>
          <a
            href="/auth/login"
            style={{
              display: 'inline-block',
              padding: `${spacing.sm} ${spacing.md}`,
              backgroundColor: colors.primary,
              color: colors.white,
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '14px',
              borderRadius: '4px',
              marginTop: spacing.lg,
            }}
          >
            Ir para Login
          </a>
        </div>
      </div>
    );
  }

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
          Criar Conta
        </h1>

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
            autoComplete="new-password"
            helpText="Mínimo 8 caracteres"
          />

          <FormField
            label="Confirmar Password"
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isSubmitting}
            autoComplete="new-password"
          />

          {actionData?.error && (
            <div
              style={{
                padding: spacing.md,
                backgroundColor: '#FFEBEE',
                borderLeft: `4px solid ${colors.critical}`,
                color: colors.critical,
                marginBottom: spacing.lg,
                borderRadius: '4px',
                fontSize: '14px',
              }}
            >
              {actionData.error}
            </div>
          )}

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
            {isSubmitting ? 'A criar conta...' : 'Criar Conta'}
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
            Já tens conta?{' '}
            <a
              href="/auth/login"
              style={{
                color: colors.primary,
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Entra aqui
            </a>
          </p>
        </Form>
      </div>
    </div>
  );
}
