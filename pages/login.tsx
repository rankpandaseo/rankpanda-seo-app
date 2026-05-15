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
import { login } from '../lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      router.push(result.redirectUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page title="Login">
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
                placeholder="Sua password"
                disabled={loading}
              />
            </FormLayout>

            <PageActions
              primaryAction={{
                content: 'Login',
                onAction: handleLogin,
                loading,
              }}
              secondaryActions={[
                {
                  content: 'Criar conta',
                  onAction: () => router.push('/signup'),
                },
              ]}
            />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
