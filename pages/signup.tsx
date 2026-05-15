import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Card,
  FormLayout,
  TextField,
  Button,
  Layout,
  Page,
  PageActions,
  Banner,
} from '@shopify/polaris';
import { signup } from '../lib/auth';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await signup(email, password, confirmPassword);
      router.push(result.redirectUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page title="Criar Conta">
      <Layout>
        <Layout.Section oneHalf>
          <Card>
            <FormLayout>
              {error && (
                <Banner tone="critical" onDismiss={() => setError('')}>
                  {error}
                </Banner>
              )}

              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="seu@email.com"
                disabled={loading}
              />

              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="Mínimo 8 caracteres"
                disabled={loading}
              />

              <TextField
                label="Confirmar Password"
                type="password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Confirme a password"
                disabled={loading}
              />
            </FormLayout>

            <PageActions
              primaryAction={{
                content: 'Criar Conta',
                onAction: handleSignup,
                loading,
              }}
              secondaryActions={[
                {
                  content: 'Já tem conta?',
                  onAction: () => router.push('/login'),
                },
              ]}
            />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
