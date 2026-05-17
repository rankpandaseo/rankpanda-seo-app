import { useState } from 'react';
import { redirect, json, type ActionFunction, type LoaderFunction } from '@remix-run/node';
import { useActionData, Form, useNavigation } from '@remix-run/react';
import { getSession } from '~/lib/session.server';
import { hashPassword } from '~/lib/auth.server';
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
    console.log('[auth.signup] form parsed:', { email: email?.substring(0, 3) + '***' });

    if (!email || !password || !confirmPassword) {
      console.log('[auth.signup] missing required fields');
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
    console.log('[auth.signup] creating user in database...');

    await db.user.create({
      data: {
        email,
        password: hashedPassword,
        status: 'pending',
        role: 'user',
      },
    });

    console.log('[auth.signup] user created successfully');
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
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <h1>Conta criada com sucesso!</h1>
        <p>Um email de confirmação foi enviado. Por favor, aguarde a aprovação do administrador.</p>
        <p>A tua conta foi criada e está em análise. Um administrador aprovará o teu acesso em breve.</p>
        <a href="/auth/login" style={{ color: '#0071e3', textDecoration: 'none', fontWeight: 'bold', fontSize: '1rem', padding: '0.5rem 1rem', display: 'inline-block' }}>
          Ir para Login
        </a>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Criar Conta</h1>

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
            autoComplete="new-password"
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
          <small style={{ display: 'block', marginTop: '0.25rem', color: '#666' }}>
            Mínimo 8 caracteres
          </small>
        </div>

        <div>
          <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Confirmar Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
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
          <div style={{ padding: '0.75rem', backgroundColor: '#fdd', borderLeft: '4px solid #c00', color: '#c00' }}>
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
          {isSubmitting ? 'A criar conta...' : 'Criar Conta'}
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#666' }}>
          Já tens conta? <a href="/auth/login" style={{ color: '#0071e3', textDecoration: 'none' }}>Entra aqui</a>
        </p>
      </Form>
    </div>
  );
}
